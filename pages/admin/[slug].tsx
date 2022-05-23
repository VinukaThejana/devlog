import { Layout } from '@components/layout/layout';
import { PostAdminTabs } from '@components/posts/post-admin-tabs';
import { EditAdminPost } from '@components/posts/post-edit-admin';
import { EditSummary } from '@components/posts/post-summary-edit';
import { MediaUpload } from '@components/posts/post-upload';
import { DB, postToJSON } from '@lib/firebase';
import { db } from 'config/firebase';
import { sessionOptions } from 'config/session';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { IPostDocument } from 'interfaces/firebase';
import { ISession } from 'interfaces/session';
import { withIronSessionSsr } from 'iron-session/next';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { ReactElement, useState } from 'react';

const EditPost = (props: { post: IPostDocument }) => {
  const { post } = props;

  const [showEditForm, setShowEditForm] = useState<boolean>(true);
  const [showPreviewForm, setShowPreviewForm] = useState<boolean>(false);
  const [showSummaryForm, setShowSummaryForm] = useState<boolean>(false);
  const [showImageForm, setShowImageForm] = useState<boolean>(false);

  // Get the created date
  const getCreatedDate = () => {
    const time =
      typeof post.createdAt === 'number'
        ? Timestamp.fromMillis(post.createdAt)
        : post.createdAt;
    return (time as unknown as Timestamp)?.toDate().toDateString();
  };

  // Get the post lastUpdated date
  const getLastUpdatedDate = () => {
    const time =
      typeof post.updatedAt === 'number'
        ? Timestamp.fromMillis(post.updatedAt)
        : post.updatedAt;
    return (time as unknown as Timestamp)?.toDate().toDateString();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Head>
        <title>Edit the post</title>
      </Head>

      <main className="flex flex-col items-center justify-center gap-2 py-20">
        <h1 className="text-4xl font-bold text-center mb-8">{post.title}</h1>
        <h2 className="text-xl text-center">Created on {getCreatedDate()}</h2>
        <h2 className="text-xl text-center">
          Last updated on {getLastUpdatedDate()}
        </h2>
        <h1 className="text-2xl font-bold text-center mt-8 mb-4">Edit post</h1>
        <PostAdminTabs
          showEditForm={showEditForm}
          showPreviewForm={showPreviewForm}
          showSummaryForm={showSummaryForm}
          showImageForm={showImageForm}
          setShowEditForm={setShowEditForm}
          setShowPreviewForm={setShowPreviewForm}
          setShowSummaryForm={setShowSummaryForm}
          setShowImageForm={setShowImageForm}
        />
        <EditAdminPost
          defaultValues={post}
          showEditForm={showEditForm}
          showPreviewForm={showPreviewForm}
          post={post}
        />
        <MediaUpload post={post} showImageForm={showImageForm} />
        <EditSummary defaultValues={post} showSummaryForm={showSummaryForm} />
      </main>
    </div>
  );
};

// Verify the auth status of the user and get the post mapped to the url
// of the user
export const getServerSideProps: GetServerSideProps = withIronSessionSsr(
  async function getServerSideProps(context) {
    const { session } = context.req;
    const { slug } = context.query;

    // Get the username and the uid from the context
    const { uid, username } = session as ISession;

    if (!uid) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    if (!username) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Get the post from the database
    const postRef = doc(
      db(),
      DB.COLLECTIONS.USERS,
      uid,
      DB.COLLECTIONS.POSTS,
      slug as string
    );
    const post = postToJSON(await getDoc(postRef)) as IPostDocument;

    // If the post is not found (If the path entered is incorrect) then
    // the post will return an Object with undefined createdAt and
    // undefined updatedAt values therefore if this object returns then
    // the path entered by the user is incorrect
    if (!post.createdAt || !post.updatedAt) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        post,
      },
    };
  },
  sessionOptions
);

EditPost.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default EditPost;
