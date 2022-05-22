import { deleteFolders } from '@lib/firebase-server';
import { firebaseAdmin } from 'config/firebase-admin';
import { sessionOptions } from 'config/session';
import { ISession } from 'interfaces/session';
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';

export default withIronSessionApiRoute(async function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle invalid mwethods
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  // Get the uid and the username from the session
  const { uid, username } = req.session as ISession;

  if (!(uid && username)) {
    return res.status(401).send('Not authorized');
  }

  // Get the idToken from the request body
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).send('No idToken was provided');
  }

  const db = firebaseAdmin.firestore();
  const storage = firebaseAdmin.storage();
  const auth = firebaseAdmin.auth();

  try {
    const decoded = await auth.verifyIdToken(idToken);

    if (decoded.uid !== uid) {
      return res.status(401).send('Not authorized');
    }
  } catch (error) {
    console.error(error);
    return res.status(401).send('Not authorized');
  }

  try {
    // Delete the firebase data
    try {
      const documentRef = db.collection('users').doc(uid);
      await db.recursiveDelete(documentRef);
    } catch (error) {
      return res.status(500);
    }

    // Delete the username document
    try {
      await db.collection('usernames').doc(username).delete();
    } catch (error) {
      console.log(error);
      return res.status(500);
    }

    // Delete all the userdata from the firebase storage
    try {
      await deleteFolders(storage, `users/${uid}`);
    } catch (error) {
      console.log(error);
      return res.status(500);
    }

    // Delete all the userdata from firebase Auth
    try {
      await auth.deleteUser(uid);
    } catch (error) {
      console.log(error);
      return res.status(500);
    }

    // Delete the user session
    try {
      req.session.destroy();
    } catch (error) {
      console.log(error);
      return res.status(500);
    }

    return res.status(200).send('User acccount deleted');
  } catch (error) {
    console.log(error);
    return res.status(500).send('Internal server error');
  }
},
sessionOptions);
