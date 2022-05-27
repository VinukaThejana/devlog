import { Loader } from '@components/utils/loader';
import { BadgeCheckIcon, XCircleIcon } from '@heroicons/react/solid';
import { DB } from '@lib/firebase';
import { auth, db } from 'config/firebase';
import { signOut, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { useData } from 'hooks/user-data';
import { IUserDocument } from 'interfaces/firebase';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { authEncoded } from '@lib/session';

export const UsernameModal = (props: {
  user: User;
  showUsernameChangeModal: boolean;
  setUsernameChangeModal: Dispatch<SetStateAction<boolean>>;
}) => {
  const { user, setUsernameChangeModal, showUsernameChangeModal } = props;
  const { mutate } = useData();

  const [formValue, setFormValue] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    showUsernameChangeModal
      ? (document.body.style.overflow = 'hidden')
      : (document.body.style.overflowX = 'hidden') &&
        (document.body.style.overflowY = 'auto');
  }, [showUsernameChangeModal]);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const regex = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    if (value.length < 3) {
      setFormValue(value.toLowerCase());
      setLoading(false);
      setIsValid(false);
    }

    if (regex.test(value)) {
      setFormValue(value.toLowerCase());
      setLoading(true);
      setIsValid(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user.emailVerified) {
      return toast.error('Please verify your email');
    }

    setValidating(true);

    // Delete the old username
    const usersRef = collection(db(), DB.COLLECTIONS.USERS);
    const usersQuery = query(
      usersRef,
      where(DB.USER.UID, '==', user.uid),
      limit(1)
    );

    const usersSnapshot = await getDocs(usersQuery);
    usersSnapshot.forEach(async (userDoc) => {
      await deleteDoc(
        doc(
          db(),
          DB.COLLECTIONS.USERNAMES,
          (userDoc.data() as IUserDocument)?.username
        )
      );
    });

    // Update the username in the session
    const username = formValue.toLowerCase();

    await fetch('/api/auth/update-username', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authEncoded}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    // Register the new username to the user
    const batch = writeBatch(db());

    const userRef = doc(db(), DB.COLLECTIONS.USERS, user.uid);
    const usernameRef = doc(
      db(),
      DB.COLLECTIONS.USERNAMES,
      formValue.toLowerCase()
    );

    batch.update(userRef, {
      username: formValue.toLowerCase(),
    });
    batch.set(usernameRef, {
      uid: user.uid,
    });

    await batch.commit();

    const userDoc = await getDoc(userRef);

    // If user have any posts then change the username in those
    // post Document
    if (userDoc.data()!.posts) {
      const idToken = await auth().currentUser?.getIdToken();

      const response = await fetch('/api/posts/update-post-username', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authEncoded}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken, newUsername: username }),
      });

      if (Number(response.status) === 500) {
        return toast.error(
          'There was an error updating the name on your posts'
        );
      } else if (Number(response.status) === 401) {
        return signOut(auth());
      } else if (Number(response.status) === 422) {
        return toast.error(
          'You have more than 500 posts to change, please contact us to update your posts'
        );
      } else {
        toast.success('Updated all your posts to use your new username 🙂');
      }
    }

    setValidating(false);
    setUsernameChangeModal(false);

    mutate();
    router.push('/profile');
  };

  // eslint-disable-next-line
  const checkUsername = useCallback(
    debounce((username: string) => {
      let unsubscribe: unknown;

      if (username.length >= 3) {
        unsubscribe = onSnapshot(
          doc(db(), DB.COLLECTIONS.USERNAMES, username),
          (doc) => {
            if (doc.exists()) {
              setIsValid(false);
              setLoading(false);
            } else {
              setIsValid(true);
              setLoading(false);
            }
          }
        );
      }

      return unsubscribe;
    }, 500),
    []
  );

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue, checkUsername]);

  return showUsernameChangeModal ? (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-x-30 inset-y-52 sm:inset-x-96 sm:inset-y-52 z-50 outline-none focus:outline-none">
      <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
        <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
          <h3 className="text-lg mt-2 sm:mt-0 sm:text-3xl font-semibold text-black">
            Choose a username
          </h3>

          <XCircleIcon
            className="w-12 text-red-500"
            type="button"
            onClick={() => setUsernameChangeModal(false)}
          />
        </div>
        <div className="relative p-6 flex-auto">
          <div className="flex flex-col items-center justify-center text-black">
            <form
              className="flex flex-col items-center justify-center py-2 px-2"
              onSubmit={onSubmit}
            >
              <div className="flex items-center justify-center">
                <input
                  name="username"
                  placeholder="Enter your username"
                  value={formValue}
                  onChange={onChange}
                  className="text-black p-2 border border-black text-center mr-2"
                />
                {loading && <Loader show={true} />}
                {isValid && <BadgeCheckIcon className="w-10 text-green-400" />}
                {!isValid && !loading && formValue && (
                  <XCircleIcon className="w-10 text-red-500" />
                )}
              </div>

              <button
                type="submit"
                disabled={!isValid}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-8 disabled:opacity-50 disabled:pointer-events-none"
              >
                {validating ? (
                  <Loader show={validating} />
                ) : (
                  <span>Submit</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
