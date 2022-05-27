import { deleteCollection, deleteFolders } from '@lib/firebase-server';
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
    return res.status(405).send('Invalid method');
  }

  // Get the uid from the session
  const { uid } = req.session as ISession;

  if (!uid) {
    return res.status(401).send('Not authorized');
  }

  const auth = firebaseAdmin.auth();
  const db = firebaseAdmin.firestore();
  const storage = firebaseAdmin.storage();

  // Get the post Slug and the post Author userId
  const { idToken, slug } = req.body;

  if (!(idToken && slug)) {
    return res.status(400).send('idToken and/or slug was not provided');
  }

  try {
    const decoded = await auth.verifyIdToken(idToken);

    if (decoded.uid !== uid) {
      return res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.error(error);
    return res.status(401).send('Unauthorized');
  }

  // Delete the post hearts
  try {
    await deleteCollection(db, `users/${uid}/posts/${slug}/hearts`, 4, res);
  } catch (error) {
    console.log(error);
    return res.status(500);
  }

  // Delete the post media from firebase storage
  try {
    await deleteFolders(storage, `users/${uid}/posts/${slug}/`);
  } catch (error) {
    console.log(error);
    return res.status(500);
  }

  return res.status(200).send('post deleted succsessfully');
},
sessionOptions);
