import { DB, deleteUser, logout } from '@lib/firebase';
import { db } from 'config/firebase';
import { useUserContext } from 'context/context';
import { updateProfile, User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useStorage } from 'hooks/use-storage';
import { useData } from 'hooks/user-data';
import { IFile } from 'interfaces/utils';
import { useRouter } from 'next/router';
import { authEncoded } from 'lib/session';
import { ChangeEvent, ReactElement, useEffect, useRef, useState } from 'react';
import { UserDisplaynameModal } from '@components/profile/user-display-name-modal';
import { UsernameModal } from '@components/profile/username-modal';
import { LogoutIcon, PencilIcon } from '@heroicons/react/solid';
import { LinkProviders } from '@components/auth/link-providers';
import { FancyButton } from '@components/utils/fancybutton';
import { Loader } from '@components/utils/loader';
import { Layout } from '@components/layout/layout';
import Image from 'next/image';

export default function Profile() {
  const { user, username, photoURL, validating } = useUserContext();
  const { mutate } = useData();

  const router = useRouter();

  // Change the profile picture
  const [profilePicture, setProfilePicture] = useState<IFile | null>(null);
  const profilePictureUploadRef = useRef<HTMLInputElement>(null);

  // Changing the username
  const [showUsernameChangeModal, setUsernameChangeModal] =
    useState<boolean>(false);

  // Changing the displayname
  const [showUserDisplaynameModal, setUserDisplaynameModal] =
    useState<boolean>(false);

  // use the storage hook to upload the profile image to firebase
  const [progress, url] = useStorage(
    profilePicture,
    'profile.jpg',
    user?.uid,
    'profile-picture'
  );

  // Handle uploading of the profile picture
  const triggerProfilePictureUpload = () => {
    profilePictureUploadRef.current?.click();
  };

  const handleProfilePictureUploadEvent = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files instanceof FileList) {
      setProfilePicture(event.target.files[0]);
    }
  };

  // update the firestore, session and auth database after upload complete
  const updateProfilePictureInfo = async () => {
    // Ref top the user document
    const userRef = doc(db(), DB.COLLECTIONS.USERS, user?.uid as string);

    await updateDoc(userRef, {
      photoURL: url,
    });

    // update the auth database
    await updateProfile(user as User, {
      photoURL: url,
    });

    // update the session
    await fetch('/api/auth/update-photo-url', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authEncoded}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoURL: url }),
    });

    setProfilePicture(null);

    mutate();
    router.push('/profile');
  };

  useEffect(
    () => {
      url && profilePicture && updateProfilePictureInfo();
    },
    // eslint-disable-next-line
    [url, profilePicture]
  );

  return validating ? (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Loader show={validating} />
    </main>
  ) : (
    <main className="flex flex-col items-center justify-center min-h-screen">
      {user && photoURL && (
        <div className="flex flex-col items-center justify-center px-10 py-20">
          <h1 className="text-3xl mb-8">{user?.displayName}</h1>
          <Image
            src={photoURL}
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
                    onClick={triggerProfilePictureUpload}
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
              await logout();
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
  );
}

Profile.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
