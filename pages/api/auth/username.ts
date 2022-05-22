import { sessionOptions } from 'config/session';
import { ISession } from 'interfaces/session';
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';

export default withIronSessionApiRoute(async function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle invalid methods
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const username = (req.session as ISession).username || '';
    return res.status(200).json(username ? { username } : null);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal server error');
  }
},
sessionOptions);
