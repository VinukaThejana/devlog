import { Loader } from '@components/utils/loader';
import { BadgeCheckIcon, XCircleIcon } from '@heroicons/react/outline';
import { DB } from '@lib/firebase';
import { db } from 'config/firebase';
import { useUserContext } from 'context/context';
import {
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import debounce from 'lodash.debounce';
import kebabCase from 'lodash.kebabcase';
import { useRouter } from 'next/router';
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import toast from 'react-hot-toast';

export const CreatePost = (props: { username: string; uid: string }) => {
  const { username, uid } = props;
  const { user } = useUserContext();

  const router = useRouter();

  const [slug, setSlug] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [creatingPost, setCreatingPost] = useState<boolean>(false);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setTitle(event.target.value.toString());
    const value = encodeURI(kebabCase(event.target.value));

    if (value.length < 3) {
      setSlug(value);
      setLoading(false);
      setIsValid(false);
    } else {
      setSlug(value);
      setIsValid(false);
      setLoading(true);
    }
  };

  // Check the postSlug
  // eslint-disable-next-line
  const checkPostSlug = useCallback(
    debounce((slug: string) => {
      let unsubscribe: unknown;

      if (slug.length >= 3) {
        console.log('Firebase read executed');
        unsubscribe = onSnapshot(
          doc(db(), DB.COLLECTIONS.USERS, uid, DB.COLLECTIONS.POSTS, slug),
          (postDoc) => {
            if (postDoc.exists()) {
              setError(
                'You have already created a post of similar title, please use a diffrent title'
              );
              setIsValid(false);
              setLoading(false);
            } else {
              setError(null);
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
    checkPostSlug(slug);
  }, [slug, checkPostSlug]);

  // Submit the new post
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingPost(true);
    setIsValid(false);

    if (!user?.emailVerified) {
      setCreatingPost(false);
      setIsValid(false);
      return toast.error('Please verify your email');
    }

    const batch = writeBatch(db());

    const newPostRef = doc(
      db(),
      DB.COLLECTIONS.USERS,
      uid,
      DB.COLLECTIONS.POSTS,
      slug
    );
    const userRef = doc(db(), DB.COLLECTIONS.USERS, uid);

    // Post initial data
    const data = {
      title,
      slug,
      uid,
      username,
      hearts: 0,
      published: false,
      content: '# Hello Wolrd',
      summary:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      summaryPhoto: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    batch.set(newPostRef, data);
    batch.update(userRef, {
      posts: increment(1),
    });

    await batch.commit();

    toast.success('The post was created');

    router.push(`/admin/${slug}`);
  };

  return !creatingPost ? (
    <form
      onSubmit={onSubmit}
      className="flex flex-col items-center justify-center"
    >
      <div className="mb-6">
        <div className="flex flex-row items-center justify-center gap-4">
          <input
            type="text"
            id="slug"
            value={title}
            onChange={onChange}
            placeholder="My awesome post"
            className="border text-sm text-center rounded-lg block w-72 sm:w-96 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          />
          {isValid && <BadgeCheckIcon className="w-9 h-9 text-green-600" />}
          {loading && <Loader show={loading} />}
          {error && !isValid && (
            <XCircleIcon className="w-9 h-9 text-red-700" />
          )}
        </div>
        {!error ? (
          <label className="block mt-2 ml-2 text-sm text-center font-medium text-gray-300">
            <strong>{slug}</strong>
          </label>
        ) : (
          <label className="block mt-2 ml-2 text-sm text-center font-medium text-red-600">
            {error}
          </label>
        )}
      </div>
      <button
        type="submit"
        disabled={!isValid}
        className="box-border relative z-30 inline-flex items-center justify-center w-auto px-8 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-indigo-600 rounded-md cursor-pointer group ring-offset-2 ring-1 ring-indigo-300 ring-offset-indigo-200 hover:ring-offset-indigo-500 ease focus:outline-none"
      >
        <span className="absolute bottom-0 right-0 w-8 h-20 -mb-8 -mr-5 transition-all duration-300 ease-out transform rotate-45 translate-x-1 bg-white opacity-10 group-hover:translate-x-0"></span>
        <span className="absolute top-0 left-0 w-20 h-8 -mt-1 -ml-12 transition-all duration-300 ease-out transform -rotate-45 -translate-x-1 bg-white opacity-10 group-hover:translate-x-0"></span>
        <span className="relative z-20 flex items-center text-sm">
          <svg
            className="relative w-5 h-5 mr-2 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            ></path>
          </svg>
          Create a new post
        </span>
      </button>
    </form>
  ) : (
    <Loader show={creatingPost} />
  );
};
