import { firebaseAdmin } from 'config/firebase-admin';
import { sessionOptions } from 'config/session';
import { IUserDocument } from 'interfaces/firebase';
import { ISession } from 'interfaces/session';
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';

export default withIronSessionApiRoute(async function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle invalid requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).send('idToken not provided');
    }

    const auth = firebaseAdmin.auth();
    const db = firebaseAdmin.firestore();

    try {
      const decoded = await auth.verifyIdToken(idToken);

      // Get the uid of the user from the verified and decoded token
      const uid = decoded.uid;

      if (!uid) {
        return res.status(400).send('idToken provided not valid');
      }

      // Get the username ans store it in  the session
      const userRef = db.collection('users').doc(uid);
      const userSnapshot = await userRef.get();
      const userData = userSnapshot.data() as IUserDocument;

      const username = userData?.username;

      if (!username) {
        return res.status(400).send('Internal server error');
      }

      // Save the username and the uid to the session
      (req.session as ISession).uid = uid;
      (req.session as ISession).username = username;

      // Save the sesion
      await req.session.save();

      return res.status(200).send('Logged in');
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
