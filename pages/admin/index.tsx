import { Layout } from '@components/layout/layout';
import { CreatePost } from '@components/posts/create-post';
import { AdminPosts } from '@components/posts/posts-admin';
import { Loader } from '@components/utils/loader';
import { useUserContext } from 'context/context';
import { ReactElement } from 'react';
import Head from 'next/head';

const Admin = () => {
	const { user, username, validating } = useUserContext();

  return validating ? (
		<main className="flex flex-col items-center justify-center min-h-screen">
			<Loader show={validating} />
		</main>
  ) : (
		<>
			{user && username ? (
				<div className="flex flex-col items-center justify-center min-h-screen">
					<Head>
						<title>Manage posts</title>
					</Head>

					<main className="flex flex-col items-center justify-center gap-4 px-5 py-20">
						<CreatePost username={username} uid={user.uid} />
						<AdminPosts uid={user.uid} />
					</main>
				</div>
			): null}
		</>
	)
};

Admin.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Admin;
