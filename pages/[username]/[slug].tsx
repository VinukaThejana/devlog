import { Layout } from '@components/layout/layout';
import { Metatags } from '@components/seo/metatags';
import { DB, fetchUserFormUsername, postToJSON } from '@lib/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from 'config/firebase';
import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { IPostDocument } from 'interfaces/firebase';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { ReactElement } from 'react';
import { PostContent } from '@components/posts/post-content';

const Post = (props: { post: IPostDocument }) => {
  // Client side data hydration
  const postRef = doc(
    db(),
    DB.COLLECTIONS.USERS,
    props.post.uid,
    DB.COLLECTIONS.POSTS,
    props.post.slug
  );

  const [realTimePost] = useDocumentData(postRef);
  const post = (realTimePost || props.post) as IPostDocument;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen overflow-x-hidden">
      <Metatags
				title={post.title}
				description={post.summary}
			/>
      <main className="flex flex-col items-center px-20 py-20 sm:px-20 sm:py-20">
        <PostContent post={post} />
      </main>
    </div>
  );
};

interface IParms extends ParsedUrlQuery {
  username: string;
  slug: string;
}

export const getStaticProps: GetStaticProps = async (props) => {
  const { username, slug } = props.params as IParms;

  // Get the user from the username
  const user = await fetchUserFormUsername(username as string);

  let post: IPostDocument;

  if (user) {
    // Get the post
    const postRef = doc(
      db(),
      DB.COLLECTIONS.USERS,
      user.uid,
      DB.COLLECTIONS.POSTS,
      slug
    );
    post = postToJSON(await getDoc(postRef)) as IPostDocument;
  } else {
    return {
      notFound: true,
    };
  }

  // If the post slug is incorrect then the post will
  // only consist of null createdAt and null updatedAts
  // therefore if that happens then definetly the path user visited
  // does not exsists
  if (!post.createdAt || !post.updatedAt) {
    return {
      notFound: true,
    };
  }

  // Do not show the post if the post id not published
  if (!post.published) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post: JSON.parse(JSON.stringify(post)),
    },
    revalidate: 5000,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate all the possible paths for the usernames and post
  // slugs

  const postsRef = collectionGroup(db(), DB.COLLECTIONS.POSTS);
  const postsQuery = query(postsRef, where(DB.POSTS.PUBLISHED, '==', true));

  const postSnapshot = await getDocs(postsQuery);
  const paths = postSnapshot.docs.map((doc) => {
    const { slug, username } = doc.data() as IPostDocument;
    return {
      params: {
        username,
        slug,
      },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
};

Post.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Post;
