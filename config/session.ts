import { ISessionCookie } from 'interfaces/session';

export const sessionOptions: ISessionCookie = {
  cookieName: '__session',
  password: process.env.SESSION_PASSWORD,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};
