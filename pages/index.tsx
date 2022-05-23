import { Layout } from '@components/layout/layout';
import { PostCard } from '@components/posts/post-card';
import { Metatags } from '@components/seo/metatags';
import { Loader } from '@components/utils/loader';
import { homeEmptyPostsBlurDataURL } from '@lib/blurdata';
import { DB, postToJSON } from '@lib/firebase';
import { db } from 'config/firebase';
import {
  collectionGroup,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
} from 'firebase/firestore';
import { IPostDocument } from 'interfaces/firebase';
import { GetServerSideProps, GetStaticProps } from 'next';
import Image from 'next/image';
import { ReactElement, useState } from 'react';

// The rate at which the new posts are fetched
const LIMIT = 1;

const Home = (props: { posts: IPostDocument[] }) => {
  const [posts, setPosts] = useState<IPostDocument[] | []>(props.posts);
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [postEnd, setPostEnd] = useState<boolean>(false);

  // Get new posts
  const getNewPosts = async () => {
    if (posts.length) {
      setPostLoading(true);
      const lastPost = posts[posts.length - 1];

      const cursor =
        typeof lastPost.createdAt === 'number'
          ? Timestamp.fromMillis(lastPost.createdAt)
          : lastPost.createdAt;

      const postsRef = collectionGroup(db(), DB.COLLECTIONS.POSTS);
      const postsQuery = query(
        postsRef,
        where(DB.POSTS.PUBLISHED, '==', true),
        orderBy(DB.POSTS.CREATED_AT, 'desc'),
        startAfter(cursor),
        limit(LIMIT)
      );

      const newPosts: IPostDocument[] = [];

      const postsSnapshot = await getDocs(postsQuery);
      postsSnapshot.forEach((doc) => {
        const newPost = postToJSON(doc) as IPostDocument;
        setPosts(posts.concat(newPost as any));
        newPosts.push(newPost);
      });

      if (newPosts.length < LIMIT) {
        setPostEnd(true);
      }

      setPostLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Metatags />
      <main className="flex flex-col items-center justify-center gap-4 px-5 py-10">
        <PostCard posts={posts} />
        {!postEnd ? (
          <>
            {posts.length ? (
              <button
                onClick={getNewPosts}
                disabled={postLoading}
                className="relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-bold text-white rounded-md shadow-2xl group"
              >
                <span className="absolute inset-0 w-full h-full transition duration-300 ease-out opacity-0 bg-gradient-to-br from-pink-600 via-purple-700 to-blue-400 group-hover:opacity-100"></span>
                <span className="absolute top-0 left-0 w-full bg-gradient-to-b from-white to-transparent opacity-5 h-1/3"></span>
                <span className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent opacity-5"></span>
                <span className="absolute bottom-0 left-0 w-4 h-full bg-gradient-to-r from-white to-transparent opacity-5"></span>
                <span className="absolute bottom-0 right-0 w-4 h-full bg-gradient-to-l from-white to-transparent opacity-5"></span>
                <span className="absolute inset-0 w-full h-full border border-white rounded-md opacity-10"></span>
                <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-5"></span>
                <span className="relative">
                  {postLoading ? <Loader show={postLoading} /> : 'Load more'}
                </span>
              </button>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4">
                <Image
                  src={'https://media.giphy.com/media/AYKv7lXcZSJig/giphy.gif'}
                  alt={'Create some posts'}
                  placeholder={'blur'}
                  blurDataURL={homeEmptyPostsBlurDataURL}
                  width={600}
                  height={400}
                />
                <h1 className="text-2xl text-center font-bold">
                  It&apos;s lonely here, Go create some posts !!!!
                </h1>
              </div>
            )}
          </>
        ) : (
          <h1 className="text-center text-lg mt-8">
            Your are all caught up .... 🎇
          </h1>
        )}
      </main>
    </div>
  );
};

/* export const getServerSideProps: GetServerSideProps = async () => {
 *   // Create a ref for all the posts of all the users
 *   const postsRef = collectionGroup(db(), DB.COLLECTIONS.POSTS);
 *   const postsQuery = query(
 *     postsRef,
 *     where(DB.POSTS.PUBLISHED, '==', true),
 *     orderBy(DB.POSTS.CREATED_AT, 'desc'),
 *     limit(5)
 *   );
 *
 *   const postsSnapshot = await getDocs(postsQuery);
 *
 *   const posts: IPostDocument[] = [];
 *   postsSnapshot.forEach((doc) => {
 *     posts.push(postToJSON(doc) as IPostDocument);
 *   });
 *
 *   return {
 *     props: {
 *       posts,
 *     },
 *   };
 * }; */

export const getStaticProps: GetStaticProps = async () => {
  const postsRef = collectionGroup(db(), DB.COLLECTIONS.POSTS);
  const postsQuery = query(
    postsRef,
    where(DB.POSTS.PUBLISHED, '==', true),
    orderBy(DB.POSTS.CREATED_AT, 'desc'),
    limit(6)
  );

  const postsSnapshot = await getDocs(postsQuery);

  const posts: IPostDocument[] = [];
  postsSnapshot.forEach((doc) => {
    posts.push(postToJSON(doc) as IPostDocument);
  });

  return {
    props: {
      posts,
    },
  };
};

Home.getLayout = function (page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
