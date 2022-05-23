import { Loader } from '@components/utils/loader';
import { DB } from '@lib/firebase';
import { auth, db } from 'config/firebase';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { IPostDocument } from 'interfaces/firebase';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { authEncoded } from '@lib/session';

export const EditAdminPost = (props: {
  defaultValues: IPostDocument;
  showEditForm: boolean;
  showPreviewForm: boolean;
  post: IPostDocument;
}) => {
  const router = useRouter();

  const { defaultValues, showEditForm, showPreviewForm, post } = props;

  const { register, handleSubmit, reset, watch, formState } = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const { isValid, isDirty, errors } = formState;

  const [deletingPost, setDeletingPost] = useState<boolean>(false);
  const [updatingPost, setUpdatingPost] = useState<boolean>(false);

  const updatePost = async (props: { content: string; published: boolean }) => {
    const { content, published } = props;
    setUpdatingPost(true);

    const postRef = doc(
      db(),
      DB.COLLECTIONS.USERS,
      defaultValues.uid,
      DB.COLLECTIONS.POSTS,
      defaultValues.slug
    );

    // Update the post
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    setUpdatingPost(false);
    reset({ content, published });

    toast.success('Post updated Succsessfully');
  };

  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <form
        onSubmit={handleSubmit(updatePost)}
        className="flex flex-col items-center justify-center"
      >
        {showPreviewForm && (
          <div className="block p-10 w-96 lg:w-[850px] lg:min-h-[650px]selection:bg-fuchsia-300 selection:text-fuchsia-900 rounded-lg border bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-100 focus:ring-blue-500 focus:border-blue-500 mt-4 mb-4">
            <ReactMarkdown>{watch('content')}</ReactMarkdown>
          </div>
        )}

        <div
          className={`${
            !showEditForm
              ? 'hidden'
              : 'flex flex-col items-center justify-center gap-4'
          }`}
        >
          <textarea
            className="block resize w-96 h-72 min-h-min sm:w-[850px] sm:h-[650px] py-4 px-8 w-full text-xl selection:bg-fuchsia-300 selection:text-fuchsia-900 rounded-lg border bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
            {...register('content', {
              required: true,
              maxLength: {
                value: 20000,
                message: 'Post content must be less than 20000 characters',
              },
              minLength: {
                value: 10,
                message: 'Post content must be at least 10 characters',
              },
            })}
          ></textarea>
          {errors.content && (
            <p className="text-sm font-bold">{errors.content?.message}</p>
          )}

          <fieldset>
            <input
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              type="checkbox"
              {...register('published')}
            />
            <label className="ml-2">Publish</label>
          </fieldset>

          <button
            type="submit"
            disabled={!isValid || !isDirty || updatingPost}
            className="box-border relative z-30 inline-flex items-center justify-center w-auto px-8 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-green-600 rounded-md cursor-pointer group ring-offset-2 ring-1 ring-indigo-300 ring-offset-indigo-200 hover:ring-offset-indigo-500 ease focus:outline-none"
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
              {updatingPost ? (
                <Loader show={updatingPost} />
              ) : (
                <span>Update post</span>
              )}
            </span>
          </button>
        </div>
      </form>

      {showEditForm && (
        <button
          onClick={async () => {
            const { slug } = post;
            setDeletingPost(true);

            const idToken = await auth().currentUser?.getIdToken();

            const response = await fetch('/api/posts/delete-post', {
              method: 'POST',
              headers: {
                Authorization: `Basic ${authEncoded}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ idToken, slug }),
            });

            if (Number(response.status) === 200) {
              toast.success(`The post ${slug} was deleted`);
              router.push('/admin');
            } else {
              toast.error('Unable to delete the post');
            }

            setDeletingPost(false);
          }}
          disabled={deletingPost}
          className="box-border relative z-30 inline-flex items-center justify-center w-auto px-8 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-red-700 rounded-md cursor-pointer group ring-offset-2 ring-1 ring-indigo-300 ring-offset-indigo-200 hover:ring-offset-indigo-500 ease focus:outline-none mt-4"
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
            {deletingPost ? (
              <Loader show={deletingPost} />
            ) : (
              <span>Delete post</span>
            )}
          </span>
        </button>
      )}
    </div>
  );
};
