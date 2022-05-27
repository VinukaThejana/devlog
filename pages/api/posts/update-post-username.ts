import { firebaseAdmin } from 'config/firebase-admin';
import { sessionOptions } from 'config/session';
import { ISession } from 'interfaces/session';
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';

export default withIronSessionApiRoute(async function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle invalid methods
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  // Get session data
  const { username, uid } = req.session as ISession;

  if (!(username && uid)) {
    return res.status(401).send('Unauthorized');
  }

  // Get the IdToken from the request body
  const { idToken, newUsername } = req.body;

  if (!(idToken && newUsername)) {
    return res.status(400).send('idToken or newUsername was not provided');
  }

  const auth = firebaseAdmin.auth();
  const db = firebaseAdmin.firestore();

  const decoded = await auth.verifyIdToken(idToken);

  if (decoded.uid !== uid) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const postsRef = db.collection(`users/${uid}/posts`);
    const postsQuery = postsRef.orderBy('__name__');

    const postsSnapshot = await postsQuery.get();
    if (postsSnapshot.docs.length > 500) {
      return res.status(422).send('Cannot update the username');
    }

    const bulkWriter = db.bulkWriter();

    try {
      postsSnapshot.docs.forEach((doc) => {
        console.log(doc.data().username);
        bulkWriter.update(doc.ref, {
          username: newUsername,
        });
      });

      try {
        await bulkWriter.flush();
      } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
      }

      return res.status(200).send('Username changed in the posts');
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal server error');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
},
sessionOptions);
