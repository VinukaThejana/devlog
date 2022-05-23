import { Loader } from '@components/utils/loader';
import { useStorage } from 'hooks/use-storage';
import { IPostDocument } from 'interfaces/firebase';
import { IFile } from 'interfaces/utils';
import { ChangeEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const MediaUpload = (props: {
  showImageForm: boolean;
  post: IPostDocument;
}) => {
  const { showImageForm, post } = props;

  const [image, setImage] = useState<IFile | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [progress, url] = useStorage(
    image,
    fileName,
    post.uid,
    `posts/${post.slug}`
  );

  useEffect(() => {
    if (Number(progress) === 100 || Number(progress) === 0 || url) {
      setLoading(false);
    } else {
      toast.success('Uploading.....');
      setLoading(true);
    }
  }, [progress, url]);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (event.target.files instanceof FileList && event.target.files.length) {
      const file = Array.from(event.target.files)[0];
      const extension = file.type.split('/')[1];

      setFileName(`${Date.now()}.${extension}`);
      setImage(event.target.files[0]);
    }
  };

  return (
    <div
      className={`${
        !showImageForm ? 'hidden' : 'flex flex-col items-center justify-center'
      }`}
    >
      <div className="flex flex-col items-center justify-center items-center w-full">
        <label className="flex flex-col justify-center items-center w-96 sm:w-[900px] h-64 rounded-lg border-2 border-dashed cursor-pointer bg-gray-700 border-gray-600 hover:border-gray-500 hover:bg-gray-600">
          <div className="flex flex-col justify-center items-center pt-5 pb-6">
            <svg
              className="mb-3 w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG or GIF (MAX. 800x400px)
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept="image/x-png, image/gif, image/jpeg"
          />
        </label>
        {loading ? (
          <Loader show={loading} />
        ) : (
          <>
            {url && (
              <code className="block py-4 px-8 w-96 sm:w-[900px] text-xl selection:bg-fuchsia-300 selection:text-fuchsia-900 rounded-lg border bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 mt-4 mb-4 break-words">
                {`![alt](${url})`}
              </code>
            )}
          </>
        )}
      </div>
    </div>
  );
};
