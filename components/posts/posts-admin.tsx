import { Loader } from '@components/utils/loader';
import { writePostsBlurDataURL } from '@lib/blurdata';
import { DB, postToJSON } from '@lib/firebase';
import { db } from 'config/firebase';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
} from 'firebase/firestore';
import { IPostDocument } from 'interfaces/firebase';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { PostCard } from './post-card';

// Rate at which new posts should be fetched
const LIMIT = 1;

export const AdminPosts = (props: { uid: string }) => {
  const { uid } = props;

  // Create a reference to the post collection
  const postsRef = collection(
    db(),
    DB.COLLECTIONS.USERS,
    uid,
    DB.COLLECTIONS.POSTS
  );
  const postsQuery = query(
    postsRef,
    orderBy(DB.POSTS.CREATED_AT, 'desc'),
    limit(5)
  );

  const [initialPosts, loading] = useCollectionData(postsQuery);

  const [posts, setPosts] = useState<IPostDocument[] | []>([]);
  const [morePostsLoading, setMorePostsLoading] = useState<boolean>(false);
  const [postsEnd, setPostsEnd] = useState<boolean>(false);

  // Load the posts from the database when they load
  useEffect(() => {
    !loading && setPosts(initialPosts as IPostDocument[]);
  }, [loading, initialPosts]);

  // Get new posts
  const getNewPosts = async () => {
    if (posts.length) {
      setMorePostsLoading(true);
      const lastPost = posts[posts.length - 1];
      const cursor =
        typeof lastPost.createdAt === 'number'
          ? Timestamp.fromMillis(lastPost.createdAt)
          : lastPost.createdAt;

      const postsQuery = query(
        postsRef,
        orderBy(DB.POSTS.CREATED_AT, 'desc'),
        startAfter(cursor),
        limit(LIMIT)
      );

      const newPosts: IPostDocument[] = [];

      const postsSnapshot = await getDocs(postsQuery);
      postsSnapshot.forEach((doc) => {
        const newPost = postToJSON(doc) as IPostDocument;
        setPosts(posts.concat(newPost as any));
      });

      if (newPosts.length < LIMIT) {
        setPostsEnd(true);
      }

      setMorePostsLoading(false);
    }
  };

  return loading ? (
    <Loader show={loading} />
  ) : (
    <div className="flex flex-col items-center justify-center mt-8 gap-4">
      <PostCard posts={posts} admin={true} />
      {morePostsLoading ? (
        <Loader show={morePostsLoading} />
      ) : (
        <div className="flex flex-col items-center gap-4">
          {postsEnd ? (
            <h1 className="text-lg text-center">
              Your are all caught up .... 🎇
            </h1>
          ) : (
            <>
              {posts?.length ? (
                <button
                  onClick={getNewPosts}
                  disabled={morePostsLoading}
                  className="relative inline-flex items-center justify-center mt-4 px-6 py-3 font-bold text-white rounded-md shadow-2xl group"
                >
                  <span className="absolute inset-0 w-full h-full transition duration-300 ease-out opacity-0 bg-gradient-to-br from-pink-600 via-purple-700 to-blue-400 group-hover:opacity-100"></span>
                  <span className="absolute top-0 left-0 w-full bg-gradient-to-b from-white to-transparent opacity-5 h-1/3"></span>
                  <span className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent opacity-5"></span>
                  <span className="absolute bottom-0 left-0 w-4 h-full bg-gradient-to-r from-white to-transparent opacity-5"></span>
                  <span className="absolute bottom-0 right-0 w-4 h-full bg-gradient-to-l from-white to-transparent opacity-5"></span>
                  <span className="absolute inset-0 w-full h-full border border-white rounded-md opacity-10"></span>
                  <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-5"></span>
                  <span className="relative">
                    {morePostsLoading ? (
                      <Loader show={morePostsLoading} />
                    ) : (
                      'Load more'
                    )}
                  </span>
                </button>
              ) : (
                <div className="flex flex-col items-center justify-center mt-2 gap-4">
                  <Image
                    src={
                      'https://media.giphy.com/media/YHpmahJgMjxL6S29Au/giphy.gif'
                    }
                    alt={'Write more posts'}
                    placeholder={'blur'}
                    blurDataURL={writePostsBlurDataURL}
                    width={600}
                    height={400}
                  />

                  <h1 className="text-2xl text-center font-bold">
                    Write your first post and see the magic !!
                  </h1>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
