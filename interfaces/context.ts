import { User } from 'firebase/auth';

export interface IUserContext {
  user: User | null | undefined;
  username: string | null | undefined;
	photoURL: string | null | undefined;
  validating: boolean | undefined;
}
