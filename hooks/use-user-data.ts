import { logout } from '@lib/firebase';
import { auth } from 'config/firebase';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useData } from './user-data';

/**
 * @description - Get the username from the cookie and the
 * user details from the database
 * */
export const useUserData = (): {
  user: User | null | undefined;
  username: string | null;
  photoURL: string | null;
  validating: boolean | undefined;
} => {
  const [user, loading] = useAuthState(auth());
  const [validating, setValidating] = useState<boolean>(true);
  const [username, setUsername] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  const { data, error } = useData();
  useEffect(() => {
    if (data) {
      setUsername(data.username);
      setPhotoURL(data.photoURL);
    }

    // Identify wether the username is loading
    const usernameLoading = data === undefined && !error;

    if (loading && usernameLoading) {
      setValidating(true);
    } else if (loading) {
      setValidating(true);
    } else if (usernameLoading) {
      setValidating(true);
    } else {
      setValidating(false);
    }

    // Check for retundant sessions
    if (!validating) {
      if (!user && data) {
        logout();
      }
    }
  }, [data, error, loading, validating, user]);

  return { user, username, photoURL, validating };
};
