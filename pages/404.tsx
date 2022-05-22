import { Layout } from '@components/layout/layout';
import { pageNotFoundBlurDataURL } from '@lib/blurdata';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { ReactElement } from 'react';

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Head>
        <title>Page not found</title>
      </Head>

      <main className="flex flex-col items-center justify-center gap-4 px-20">
        <Image
          src={'https://media.giphy.com/media/UoeaPqYrimha6rdTFV/giphy.gif'}
          alt={'Page not found'}
          placeholder={'blur'}
          blurDataURL={pageNotFoundBlurDataURL}
          width={600}
          height={500}
        />
        <h1 className="text-2xl font-bold mt-16">The page does not exsist</h1>
        <Link href="/" passHref>
          <h2 className="text-2xl font-bold underline">Go back</h2>
        </Link>
      </main>
    </div>
  );
}

Custom404.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
