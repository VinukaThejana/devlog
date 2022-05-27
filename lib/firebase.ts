import { auth, db } from 'config/firebase';
import { signOut } from 'firebase/auth';
import {
  collection,
  DocumentSnapshot,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';
import { IUserDocument } from 'interfaces/firebase';
import toast from 'react-hot-toast';
import { authEncoded } from '@lib/session';

/**
 * @description - An object containing firebase database documents and
 * collections
 * */
export const DB = {
  USER: {
    DISPLAY_NAME: 'displayName',
    EMAIL: 'email',
    PHOTO_URL: 'photoUrl',
    UID: 'uid',
    USERNAME: 'username',
  },
  POSTS: {
    CONTENT: 'content',
    CREATED_AT: 'createdAt',
    PUBLISHED: 'published',
    SLUG: 'slug',
    TITLE: 'title',
    HEARTS: 'hearts',
    UID: 'uid',
    UPDATED_AT: 'updatedAt',
    USERNAME: 'username',
  },
  COLLECTIONS: {
    USERS: 'users',
    USERNAMES: 'usernames',
    POSTS: 'posts',
    HEARTS: 'hearts',
  },
};

/**
 * @description - Get the user when the username of the user is provided
 * @params {string} username - The user name of the user
 * @returns {Promise<IUserDocument | null>} user - The user that owns the given username
 * */
export const fetchUserFormUsername = async (
  username: string
): Promise<IUserDocument | null> => {
  // Create a reference to the users collection
  const usersRef = collection(db(), DB.COLLECTIONS.USERS);
  // Query the username contaning collection
  const usersQuery = query(
    usersRef,
    where(DB.USER.USERNAME, '==', username),
    limit(1)
  );

  const userSnapshot = await getDocs(usersQuery);
  let user;
  try {
    user = userSnapshot.docs[0].data() as IUserDocument;
  } catch {
    user = null;
  }

  return user;
};

/**
 * @description - Returns the given output by searializing it to JSON format
 * */
export const postToJSON = (doc: DocumentSnapshot) => {
  const data = doc.data();
  return {
    ...data,
    createdAt: data?.createdAt.toMillis(),
    updatedAt: data?.updatedAt.toMillis(),
  };
};

/**
 * @description - Delete the user and all of the userdata
 * */
export const deleteUser = async () => {
  toast.success('Deleting your account ...');

  const idToken = await auth().currentUser?.getIdToken();
  const response = await fetch('/api/auth/delete', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authEncoded}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (Number(response.status) === 200) {
    signOut(auth());
    toast.success('Deleted your account');
  } else {
    toast.error('There was a problem deleting your account');
  }
};

/**
 * @description - Logout the user safely by deleting the session
 * */
export const logout = async () => {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authEncoded}`,
      'Content-Type': 'application/json',
    },
  });

  await signOut(auth());
};
