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

  // Get the uid from the session
  const { uid } = req.session as ISession;

  if (!uid) {
    return res.status(401).send('Not authorized');
  }

  // Get the photoURL from the request body
  const { photoURL } = req.body;

  if (!photoURL) {
    return res.status(400).send('photoURL not provided');
  }

  try {
    (req.session as ISession).photoURL = photoURL;
    await req.session.save();

    return res.status(200).send('photoURL changed succsessfully');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
},
sessionOptions);
