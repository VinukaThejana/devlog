import { Layout } from '@components/layout/layout';
import { CreatePost } from '@components/posts/create-post';
import { AdminPosts } from '@components/posts/posts-admin';
import { sessionOptions } from 'config/session';
import { ISession } from 'interfaces/session';
import { withIronSessionSsr } from 'iron-session/next';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { ReactElement } from 'react';

const Admin = (props: { username: string; uid: string }) => {
  const { username, uid } = props;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Head>
        <title>Manage posts</title>
      </Head>

      <main className="flex flex-col items-center justify-center gap-4 px-5 py-20">
        <CreatePost username={username} uid={uid} />
        <AdminPosts uid={uid} />
      </main>
    </div>
  );
};

// Only let authenticated users visit this page
export const getServerSideProps: GetServerSideProps = withIronSessionSsr(
  async function getServerSideProps(context) {
    const { session } = context.req;

    const { username, uid } = session as ISession;

		if (!(username && uid)) {
			return {
				redirect: {
					destination: "/login",
					permanent: false
				}
			}
		}

    return {
      props: {
        username,
        uid,
      },
    };
  },
  sessionOptions
);

Admin.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Admin;
