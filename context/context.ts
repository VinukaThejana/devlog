import { IUserContext } from 'interfaces/context';
import { createContext, useContext } from 'react';

export const UserContext = createContext<IUserContext>({
  user: undefined,
  username: undefined,
	photoURL: undefined,
  validating: undefined,
});

export const useUserContext = () => {
  return useContext(UserContext);
};
