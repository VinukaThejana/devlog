import { IronSession } from 'iron-session';

export interface ISessionCookie {
  cookieName: string;
  password: string;
  cookieOptions: {
    secure: boolean;
  };
}

export type ISession = IronSession & {
  uid: string;
  username: string;
  photoURL: string;
};
