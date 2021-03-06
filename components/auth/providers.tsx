import { Loader } from '@components/utils/loader';
import { auth, db } from 'config/firebase';
import { FirebaseError } from 'firebase-admin';
import {
  AuthProvider,
  getAdditionalUserInfo,
  getRedirectResult,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
  TwitterAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction, useEffect, useReducer } from 'react';
import { authEncoded } from '@lib/session';
import toast from 'react-hot-toast';

export const ProviderTypes = (props: {
  register: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  const { register, setLoading } = props;

  // Supported authentication providers
  enum PROVIDERS {
    GOOGLE = 'GOOGLE',
    GITHUB = 'GITHUB',
    TWITTER = 'TWITTER',
    PROVIDER = 'PROVIDER',
  }

  interface ProviderState {
    googleLoadingState: boolean;
    githubLoadingState: boolean;
    twitterLoadingState: boolean;
    providerLoadingState: boolean;
  }

  interface ProviderAction {
    type: PROVIDERS;
    payload: boolean;
  }

  // function to state the provider state with useReducer
  function providerReducer(
    state: ProviderState,
    action: ProviderAction
  ): ProviderState {
    const { type, payload } = action;

    switch (type) {
      case PROVIDERS.GOOGLE:
        return {
          ...state,
          googleLoadingState: payload,
        };
      case PROVIDERS.GITHUB:
        return {
          ...state,
          githubLoadingState: payload,
        };
      case PROVIDERS.TWITTER:
        return {
          ...state,
          twitterLoadingState: payload,
        };
      case PROVIDERS.PROVIDER:
        return {
          ...state,
          providerLoadingState: payload,
        };
      default:
        return state;
    }
  }

  // provider state management
  const [state, dispatch] = useReducer(providerReducer, {
    googleLoadingState: false,
    githubLoadingState: false,
    twitterLoadingState: false,
    providerLoadingState: false,
  } as ProviderState);

  const router = useRouter();

  // Get the redirect result from signInWithRedirect
  useEffect(() => {
    getRedirectResult(auth())
      .then(async (result) => {
        if (result) {
          setLoading(true);
          if (getAdditionalUserInfo(result)?.isNewUser) {
            // The user is a new user
            const { uid, displayName, photoURL, email } = result.user;
            // Generate a username for the user
            const username =
              displayName?.replace(' ', '-').toLowerCase() +
              new Date().getMilliseconds().toString();

            let profilePicture = photoURL;
            if (!profilePicture) {
              profilePicture = `https://avatars.dicebear.com/api/adventurer/${uid}.svg`;

              // update the profile picture with the auth profile
              updateProfile(result.user, {
                photoURL: profilePicture,
              });
            }

            const userRef = doc(db(), 'users', uid);
            const usernameRef = doc(db(), 'usernames', username);

            const batch = writeBatch(db());

            batch.set(userRef, {
              uid,
              displayName,
              photoURL: profilePicture,
              email,
              username,
              posts: 0,
            });
            batch.set(usernameRef, {
              uid,
            });

            await batch.commit();
          }
          // Get the idToken of the user
          const idToken = await result.user.getIdToken();

          // Create a session for new as well as loggin in users
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              Authorization: `Basic ${authEncoded}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });

          if (Number(response.status) === 200) {
            router.reload();
          } else {
            toast.error('An error occured');
            signOut(auth());
          }
        }
      })
      .catch((error: FirebaseError) => {
        setLoading(false);
        if (error.code === 'auth/account-exists-with-different-credential') {
          toast.error('There is already an account using this email address');
        } else {
          console.error(error);
        }
      });
  });

  // Login or register the user
  // Login + Register = logister ????
  function logister(agent: PROVIDERS) {
    let provider: unknown;
    switch (agent) {
      case PROVIDERS.GOOGLE:
        provider = new GoogleAuthProvider();
        break;
      case PROVIDERS.GITHUB:
        provider = new GithubAuthProvider();
        break;
      case PROVIDERS.TWITTER:
        provider = new TwitterAuthProvider();
        break;
    }

    // Set the loading state
    dispatch({
      type: agent,
      payload: true,
    });
    dispatch({
      type: PROVIDERS.PROVIDER,
      payload: true,
    });

    signInWithRedirect(auth(), provider as AuthProvider);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {/* Google */}
      <button
        type="button"
        className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-base px-10 py-3 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2"
        disabled={state.googleLoadingState || state.providerLoadingState}
        onClick={async () => {
          logister(PROVIDERS.GOOGLE);
        }}
      >
        <>
          {!state.googleLoadingState ? (
            <svg
              className="w-5 h-5 mr-2 -ml-1"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
          ) : (
            <Loader show={state.googleLoadingState} />
          )}
        </>
        {`${register ? 'Register with Google' : 'Login with Google'}`}
      </button>

      {/* Github */}
      <button
        type="button"
        className="text-white bg-gray-900 hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-base px-10 py-3 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2"
        disabled={state.githubLoadingState || state.providerLoadingState}
        onClick={async () => {
          logister(PROVIDERS.GITHUB);
        }}
      >
        <>
          {!state.githubLoadingState ? (
            <svg
              className="w-5 h-5 mr-2 -ml-1"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="github"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 496 512"
            >
              <path
                fill="currentColor"
                d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
              ></path>
            </svg>
          ) : (
            <Loader show={state.githubLoadingState} />
          )}
        </>
        {`${register ? 'Register with Github' : 'Login with Github'}`}
      </button>

      {/* Twitter */}
      <button
        type="button"
        className="text-white bg-[#1da1f2] hover:bg-[#1da1f2]/90 focus:ring-4 focus:outline-none focus:ring-[#1da1f2]/50 font-medium rounded-lg text-base px-10 py-3 text-center inline-flex items-center dark:focus:ring-[#1da1f2]/55 mr-2 mb-2"
        disabled={state.twitterLoadingState || state.providerLoadingState}
        onClick={async () => {
          logister(PROVIDERS.TWITTER);
        }}
      >
        <>
          {!state.twitterLoadingState ? (
            <svg
              className="w-5 h-5 mr-2 -ml-1"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="twitter"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path
                fill="currentColor"
                d="M459.4 151.7c.325 4.548 .325 9.097 .325 13.65 0 138.7-105.6 298.6-298.6 298.6-59.45 0-114.7-17.22-161.1-47.11 8.447 .974 16.57 1.299 25.34 1.299 49.06 0 94.21-16.57 130.3-44.83-46.13-.975-84.79-31.19-98.11-72.77 6.498 .974 12.99 1.624 19.82 1.624 9.421 0 18.84-1.3 27.61-3.573-48.08-9.747-84.14-51.98-84.14-102.1v-1.299c13.97 7.797 30.21 12.67 47.43 13.32-28.26-18.84-46.78-51.01-46.78-87.39 0-19.49 5.197-37.36 14.29-52.95 51.65 63.67 129.3 105.3 216.4 109.8-1.624-7.797-2.599-15.92-2.599-24.04 0-57.83 46.78-104.9 104.9-104.9 30.21 0 57.5 12.67 76.67 33.14 23.72-4.548 46.46-13.32 66.6-25.34-7.798 24.37-24.37 44.83-46.13 57.83 21.12-2.273 41.58-8.122 60.43-16.24-14.29 20.79-32.16 39.31-52.63 54.25z"
              ></path>
            </svg>
          ) : (
            <Loader show={state.twitterLoadingState} />
          )}
        </>
        {`${register ? 'Register with Twitter' : 'Login with Twitter'}`}
      </button>
    </div>
  );
};
