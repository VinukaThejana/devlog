import { Loader } from '@components/utils/loader';
import { XCircleIcon } from '@heroicons/react/solid';
import { DB } from '@lib/firebase';
import { db } from 'config/firebase';
import { updateProfile, User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import toast from 'react-hot-toast';

export const UserDisplaynameModal = (props: {
  user: User;
  showUserDisplaynameModal: boolean;
  setUserDisplaynameModal: Dispatch<SetStateAction<boolean>>;
}) => {
  const { user, showUserDisplaynameModal, setUserDisplaynameModal } = props;
  const [formValue, setFormValue] = useState<string>('');
  const [validating, setValidating] = useState<boolean>(false);

  useEffect(() => {
    showUserDisplaynameModal
      ? (document.body.style.overflow = 'hidden')
      : (document.body.style.overflowX = 'hidden') &&
        (document.body.style.overflowY = 'auto');
  }, [showUserDisplaynameModal]);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValue(event.target.value);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user.emailVerified) {
      return toast.error('Please verify your email');
    }

    setValidating(true);

    // Change the username in the firebase
    const userRef = doc(db(), DB.COLLECTIONS.USERS, user.uid);
    await updateDoc(userRef, {
      displayName: formValue,
    });

    // Update the firebase authentication data
    await updateProfile(user, {
      displayName: formValue,
    });

    setValidating(false);
    setUserDisplaynameModal(false);
  };

  return showUserDisplaynameModal ? (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-x-30 inset-y-52 sm:inset-x-96 sm:inset-y-52 z-50 outline-none focus:outline-none">
      <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
        <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
          <h3 className="text-lg mt-2 sm:mt-0 sm:text-3xl font-semibold text-black mr-4">
            Choose a name to display
          </h3>

          <XCircleIcon
            className="w-12 text-red-500"
            type="button"
            onClick={() => setUserDisplaynameModal(false)}
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
                  placeholder="Enter your display name"
                  value={formValue}
                  onChange={onChange}
                  className="text-black p-2 border border-black text-center mr-2"
                />
              </div>

              <button
                type="submit"
                disabled={validating}
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
