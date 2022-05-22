import { Layout } from '@components/layout/layout';
import { PostCard } from '@components/posts/post-card';
import { Metatags } from '@components/seo/metatags';
import { Loader } from '@components/utils/loader';
import { DB, fetchUserFormUsername, postToJSON } from '@lib/firebase';
import { db } from 'config/firebase';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
} from 'firebase/firestore';
import { IPostDocument, IUserDocument } from 'interfaces/firebase';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { ParsedUrlQuery } from 'querystring';
import { ReactElement, useState } from 'react';

// Rate at which the new posts are loaded
const LIMIT = 1;

const UserPublicRoot = (props: {
  user: IUserDocument;
  posts: IPostDocument[];
}) => {
  const { user } = props;
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

      const postsRef = collection(
        db(),
        DB.COLLECTIONS.USERS,
        user.uid,
        DB.COLLECTIONS.POSTS
      );
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
      <Metatags
        title={user.displayName}
        image={user.photoURL}
        description={`See the posts of ${user.username}`}
      />

      <main className="flex flex-col items-center justify-center px-5 py-20 gap-4">
        <Image
          src={user.photoURL}
          alt={user.displayName}
          width={200}
          height={200}
          className="rounded-full mr-4"
        />
        <h1 className="text-3xl font-bold">{user.displayName}</h1>
        <h1 className="text-2xl font-bol">{user.email}</h1>
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
            ) : null}
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

interface IParams extends ParsedUrlQuery {
  username: string;
}

export const getStaticProps: GetStaticProps = async (props) => {
  const { username } = props.params as IParams;

  // Get the user from the username
  const user = await fetchUserFormUsername(username as string);

  const posts: IPostDocument[] = [];

  if (user) {
    const uid = user.uid;

    const postsRef = collection(
      db(),
      DB.COLLECTIONS.USERS,
      uid,
      DB.COLLECTIONS.POSTS
    );

    const postsQuery = query(
      postsRef,
      where(DB.POSTS.PUBLISHED, '==', true),
      orderBy(DB.POSTS.CREATED_AT, 'desc'),
      limit(5)
    );

    const postsSnapshot = await getDocs(postsQuery);
    postsSnapshot.forEach((post) => {
      posts.push(postToJSON(post) as IPostDocument);
    });
  } else {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      user,
      posts,
    },
    revalidate: 5000,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const usersRef = collection(db(), DB.COLLECTIONS.USERS);
  const usersSnapshot = await getDocs(usersRef);

  const paths = usersSnapshot.docs.map((doc) => {
    const { username } = doc.data() as IUserDocument;
    return {
      params: {
        username,
      },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
};

UserPublicRoot.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default UserPublicRoot;
