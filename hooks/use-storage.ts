import { storage } from 'config/firebase';
import {
  getDownloadURL,
  ref,
  StorageError,
  uploadBytesResumable,
} from 'firebase/storage';
import { IStorageUploadState } from 'interfaces/firebase';
import { IFile } from 'interfaces/utils';
import { useEffect, useState } from 'react';

/**
 * @description - Upload the given file to the firebase storage
 * in the user folder in the specified path
 * */
export const useStorage = (
  file: IFile | null,
  fileName: string,
  uid: string | undefined,
  path: string
): [number, string | null, IStorageUploadState, StorageError | null] => {
  // States
  const [url, setUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploadState, setUploadState] =
    useState<IStorageUploadState>(undefined);
  const [error, setError] = useState<StorageError | null>(null);

  useEffect(() => {
    if (file && uid) {
      // Metadata for the file
      const metadata = {
        contentType: file.type,
      };

      const storagePath = `users/${uid}/${path}/${fileName}`;

      const storageRef = ref(storage(), storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Get the progress of the currently uploading file
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);

          switch (snapshot.state) {
            case 'paused':
              setUploadState('paused');
            case 'running':
              setUploadState('running');
            case 'canceled':
              setUploadState('canceled');
          }
        },
        (error: StorageError) => {
          setError(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setUrl(downloadURL);
          });
        }
      );
    }
  }, [file, uid, uploadState, error, path]);

  return [progress, url, uploadState, error];
};
