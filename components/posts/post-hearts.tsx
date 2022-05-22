import { DB } from '@lib/firebase';
import { db } from 'config/firebase';
import { HeartIcon as SolidHeartIcon } from '@heroicons/react/solid';
import { HeartIcon as OutlineHeartIcon } from '@heroicons/react/outline';
import { doc, increment, writeBatch } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
import { Loader } from '@components/utils/loader';
import { useUserContext } from 'context/context';
import toast from 'react-hot-toast';

export const Hearts = (props: {
  uidOfAuthor: string;
  uidOfUser: string;
  slug: string;
}) => {
  const { uidOfAuthor, uidOfUser, slug } = props;
  const { user } = useUserContext();

  // Reference to the current post
  const postRef = doc(
    db(),
    DB.COLLECTIONS.USERS,
    uidOfAuthor,
    DB.COLLECTIONS.POSTS,
    slug
  );

  // Reference the heart document
  const heartRef = doc(
    db(),
    DB.COLLECTIONS.USERS,
    uidOfAuthor,
    DB.COLLECTIONS.POSTS,
    slug,
    DB.COLLECTIONS.HEARTS,
    uidOfUser
  );

  const [heartDoc, loading] = useDocument(heartRef);

  // Add an heart to a post
  const addHeart = async () => {
    if (!user?.emailVerified) {
      return toast.error('Please verify your Email');
    }

    const batch = writeBatch(db());

    // Increament the hearts count for the post
    batch.update(postRef, {
      hearts: increment(1),
    });

    // Now the user hearted the document add the user document to the hearts collection
    // of the post
    batch.set(heartRef, {
      uid: uidOfUser,
    });

    await batch.commit();
  };

  // Remove an heart from the post
  const removeHeart = async () => {
    const batch = writeBatch(db());

    // Decreament the hearts count of the post
    batch.update(postRef, {
      hearts: increment(-1),
    });

    // Remove the uid from the hearts document of the post
    batch.delete(heartRef);

    await batch.commit();
  };

  return !loading ? (
    <div className="flex flex-row items-center justify-center gap-4">
      {heartDoc?.exists() ? (
        <SolidHeartIcon
          type="button"
          onClick={removeHeart}
          className="w-9 h-9 text-red-700"
        />
      ) : (
        <OutlineHeartIcon
          type="button"
          onClick={addHeart}
          className="w-9 h-9 text-red-700"
        />
      )}
    </div>
  ) : (
    <Loader show={loading} />
  );
};
