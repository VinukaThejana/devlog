import { User } from 'firebase/auth';

/**
 * @description - Get the authorization token combining the username and the password
 * */
export const authEncoded = btoa(
  `${process.env.NEXT_PUBLIC_ROUTE_USERNAME}:${process.env.NEXT_PUBLIC_ROUTE_PASSWORD}`
);

export const reactIfSessionChanged = async (
  validating: boolean | undefined,
  user: User | null | undefined,
  username: string | null | undefined,
  mutate: any
) => {
  if (!validating) {
    if (user) {
      if (username === null) {
        // The cookie has been expired or deleted
        // but the user is still logged as long as firebase is
        // concerned

        // Please note that this function will try to run on the weired edge case
        // where when loggin in the with the provider and the session is being created
        // Hence this will fail when running; This senario can be safely ignored as it produces
        // no harmful outcome

        // Get the user idToken
        const idToken = await user.getIdToken();

        // Create a new session for the user
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authEncoded}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        mutate();
      }
    }
  }
};
