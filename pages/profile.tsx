import { Layout } from '@components/layout/layout';
import { Loader } from '@components/utils/loader';
import { LogoutIcon, PencilIcon } from '@heroicons/react/solid';
import { sessionOptions } from 'config/session';
import { useUserContext } from 'context/context';
import { IFile } from 'interfaces/utils';
import { ISession } from 'interfaces/session';
import { withIronSessionSsr } from 'iron-session/next';
import Image from 'next/image';
import { ChangeEvent, ReactElement, useEffect, useRef, useState } from 'react';
import { useStorage } from 'hooks/use-storage';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from 'config/firebase';
import { DB, deleteUser } from '@lib/firebase';
import { signOut, updateProfile, User } from 'firebase/auth';
import { useRouter } from 'next/router';
import { UsernameModal } from '@components/profile/username-modal';
import { FancyButton } from '@components/utils/fancybutton';
import { UserDisplaynameModal } from '@components/profile/user-display-name-modal';
import { LinkProviders } from '@components/auth/link-providers';
import { authEncoded } from '@lib/session';

const Profile = () => {
  const { user, username, validating } = useUserContext();

  const router = useRouter();

  // For changing the profile picture
  const [profilePicture, setProfilePicture] = useState<IFile | null>(null);
  const profilePictureUploadRef = useRef<HTMLInputElement>(null);

  // For changing the username
  const [showUsernameChangeModal, setUsernameChangeModal] =
    useState<boolean>(false);

  // For changing the user displayName
  const [showUserDisplaynameModal, setUserDisplaynameModal] =
    useState<boolean>(false);

  const [progress, url] = useStorage(
    profilePicture,
    'profile.jpg',
    user?.uid,
    'profile-picture'
  );

  // Hide the input button and emitate clicking it when the custom
  // button is pressed
  const triggerProfilePictureUpoad = () => {
    profilePictureUploadRef.current?.click();
  };

  // Handle the profile picture upload event
  const handleProfilePictureUploadEvent = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    if (event.target.files instanceof FileList) {
      setProfilePicture(event.target.files[0]);
    }
  };

  // Listen to changes in the profilePicture and trigger the
  // upload event accordingly
  useEffect(() => {
    if (url) {
      const updateTheProfilePicture = async () => {
        // Update the profile pciture on the users/uid document
        const userRef = doc(db(), DB.COLLECTIONS.USERS, user?.uid as string);

        await updateDoc(userRef, {
          photoURL: url,
        });

        // Update the profile pcture in the firebase
        // authentication database
        updateProfile(user as User, {
          photoURL: url,
        })
          .then(async () => {
            setProfilePicture(null);
            await auth().currentUser?.reload();
            router.push('/profile');
          })
          .catch((error) => console.error(error));
        setProfilePicture(null);
      };

      updateTheProfilePicture();
    }
  }, [url, user, router]);

  return !validating ? (
    <main className="flex flex-col items-center justify-center min-h-screen">
      {user && (
        <div className="flex flex-col items-center justify-center px-10 py-20">
          <h1 className="text-3xl mb-8">{user?.displayName}</h1>
          <Image
            src={user.photoURL as string}
            alt={user.displayName as string}
            width={200}
            height={200}
            className="rounded-full"
          />
          <>
            <form className="z-50">
              <input
                type="file"
                accept="image/x-png, image/jpeg"
                onChange={handleProfilePictureUploadEvent}
                ref={profilePictureUploadRef}
                className="hidden"
              />
              {(0 < progress && progress < 100) || profilePicture ? (
                <div className="h-12 z-50 -mt-8 ml-24 bg-black rounded-full p-2">
                  <div className="w-8 h-8 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              ) : (
                <>
                  <PencilIcon
                    className="h-12 z-50 -mt-8 ml-24 bg-black rounded-full p-2"
                    type="button"
                    onClick={triggerProfilePictureUpoad}
                  />
                </>
              )}
            </form>
          </>

          <div className="sm:flex sm:mt-4 sm:mb-4 sm:gap-4">
            <div className="flex flex-col items-center justify-center mt-8 sm:mt-0 gap-2">
              <p className="text-xl">Change the username</p>
              <FancyButton
                buttonText={username as string}
                state={showUsernameChangeModal}
                setState={setUsernameChangeModal}
              />
            </div>

            <div className="flex flex-col items-center justify-center mt-8 sm:mt-0 mb-8 sm:mb-0 gap-2">
              <p className="text-xl">Change the displayname</p>
              <FancyButton
                buttonText={`⠀${user.displayName}⠀`}
                state={showUserDisplaynameModal}
                setState={setUserDisplaynameModal}
              />
            </div>
          </div>

          <LinkProviders providerData={user.providerData} />

          <button
            onClick={async () => {
              await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                  Authorization: `Basic ${authEncoded}`,
                  'Content-Type': 'application/json',
                },
              });
              await signOut(auth());
              router.push('/');
            }}
            className="inline-block py-3 text-xl text-white bg-gray-800 px-8 hover:bg-gray-700 rounded-xl mt-4 flex"
          >
            <LogoutIcon className="w-6 h-6" />
            <span>⠀Sign out⠀</span>
          </button>

          <button
            onClick={async () => {
              await deleteUser();
              router.push('/');
            }}
            className="inline-block py-3 text-xl text-white bg-red-800 px-7 hover:bg-red-600 rounded-xl mt-2"
          >
            Delete account
          </button>

          <UsernameModal
            user={user}
            showUsernameChangeModal={showUsernameChangeModal}
            setUsernameChangeModal={setUsernameChangeModal}
          />

          <UserDisplaynameModal
            user={user}
            showUserDisplaynameModal={showUserDisplaynameModal}
            setUserDisplaynameModal={setUserDisplaynameModal}
          />
        </div>
      )}
    </main>
  ) : (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Loader show={validating} />
    </main>
  );
};

// Check if the user is authenticated
export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps(context) {
    const { session } = context.req;

    // Do not render the page of the session is absent
    if ((session as ISession).uid) {
      return {
        props: {},
      };
    }

    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  },
  sessionOptions
);

Profile.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Profile;
