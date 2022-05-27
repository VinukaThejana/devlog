import { Loader } from '@components/utils/loader';
import { DB } from '@lib/firebase';
import { db } from 'config/firebase';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useStorage } from 'hooks/use-storage';
import { IPostDocument } from 'interfaces/firebase';
import { IFile } from 'interfaces/utils';
import { ChangeEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export const EditSummary = (props: {
  showSummaryForm: boolean;
  defaultValues: IPostDocument;
}) => {
  const { defaultValues, showSummaryForm } = props;

  const [updatingSummary, setUpdatingSummary] = useState<boolean>(false);

  const { register, handleSubmit, reset, formState } = useForm({
    defaultValues,
    mode: 'onChange',
  });

  const { isValid, isDirty, errors } = formState;

  const updatePostSummary = async (props: { summary: string }) => {
    const { summary } = props;
    setUpdatingSummary(true);

    const postRef = doc(
      db(),
      DB.COLLECTIONS.USERS,
      defaultValues.uid,
      DB.COLLECTIONS.POSTS,
      defaultValues.slug
    );

    await updateDoc(postRef, {
      summary,
      updatedAt: serverTimestamp(),
    });

    reset({ summary });
    setUpdatingSummary(false);
    toast.success('Post updated succsessfully');
  };

  // Handle summary image upload
  const [image, setImage] = useState<IFile | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [progress, url] = useStorage(
    image,
    filename,
    defaultValues.uid,
    `posts/${defaultValues.slug}/summary`
  );

  useEffect(
    () => {
      if (Number(progress) > 0 && Number(progress) < 100 && !url) {
        toast.success('Uploading.....');
        setLoading(true);
      }

      const updateSummaryPhoto = async () => {
        toast.success('Uploaded');

        const postRef = doc(
          db(),
          DB.COLLECTIONS.USERS,
          defaultValues.uid,
          DB.COLLECTIONS.POSTS,
          defaultValues.slug
        );
        await updateDoc(postRef, {
          summaryPhoto: url,
        });
      };

      url && Number(progress) === 100 && updateSummaryPhoto();
    },
    // eslint-disable-next-line
    [url]
  );

  // Handle summary image upload
  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.target.files instanceof FileList && event.target.files.length) {
      setFilename('summary.jpg');
      setImage(event.target.files[0]);
    }
  };

  return (
    <div
      className={`${
        !showSummaryForm
          ? 'hidden'
          : 'flex flex-col items-center justify-center'
      }`}
    >
      <form
        onSubmit={handleSubmit(updatePostSummary)}
        className="flex flex-col items-center justify-center"
      >
        <textarea
          className="block resize w-96 h-72 sm:w-[850px] sm:h-[300px] py-4 px-8 w-full text-xl selection:bg-fuchsia-300 selection:text-fuchsia-900  rounded-lg border  bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          {...register('summary', {
            required: true,
            maxLength: {
              value: 580,
              message: 'Summary must not be greater than 100 words',
            },
            minLength: {
              value: 100,
              message: 'The summary must be greater than 50 words',
            },
          })}
        ></textarea>
        {errors.summary && (
          <p className="text-sm font-bold">{errors.summary?.message}</p>
        )}

        {loading ? (
          <Loader show={loading} />
        ) : (
          <input
            onChange={handleUpload}
            className="block w-full text-lg rounded-lg border cursor-pointer text-gray-400 focus:outline-none bg-gray-700 border-gray-600 placeholder-gray-400 mt-4"
            type="file"
            accept="image/x-png, image/jpeg"
          />
        )}

        <button
          type="submit"
          disabled={!isValid || !isDirty || updatingSummary}
          className="box-border relative z-30 inline-flex items-center justify-center w-auto px-8 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-green-600 rounded-md cursor-pointer group ring-offset-2 ring-1 ring-indigo-300 ring-offset-indigo-200 hover:ring-offset-indigo-500 ease focus:outline-none mt-8"
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
            {updatingSummary ? (
              <Loader show={updatingSummary} />
            ) : (
              <span>Update post</span>
            )}
          </span>
        </button>
      </form>
    </div>
  );
};
