import { Loader } from '@components/utils/loader';
import { HeartIcon } from '@heroicons/react/solid';
import { useUserContext } from 'context/context';
import { IPostDocument } from 'interfaces/firebase';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Hearts } from './post-hearts';

export const PostContent = (props: { post: IPostDocument }) => {
  const { post } = props;

  const { user, validating } = useUserContext();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-center">{post.title}</h1>
      <span className="text-base sm:text-2xl font-bold text-center">
        Written by{' '}
        <Link href={`/${post.username}`} passHref>
          <a className="underline">{post.username}</a>
        </Link>
      </span>

      {/* Heart section */}
      <section className="flex flex-row items-center justify-center">
        {validating ? (
          <Loader show={validating} />
        ) : (
          <>
            {!user ? (
              <div className="flex flex-row items-center justify-center gap-2">
                <HeartIcon
                  type="button"
                  onClick={() => {
                    toast.success('Login or Register to heart posts');
                  }}
                  className="w-9 h-9 text-red-700"
                />
                <p className="text-2xl font-bold text-white">{post.hearts}</p>
              </div>
            ) : (
              <div className="flex flex-row items-center justify-center gap-2">
                <Hearts
                  uidOfAuthor={props.post.uid}
                  uidOfUser={user.uid}
                  slug={props.post.slug}
                />
                <p className="text-2xl font-bold text-white">{post.hearts}</p>
              </div>
            )}
          </>
        )}
      </section>

      <div className="selection:bg-fuchsia-300 selection:text-fuchsia-900 bg-gray-900 mt-8 rounded-xl w-96 md:w-[600px] lg:w-[800px] px-10 py-10 sm:px-20 sm:py-20">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </div>
  );
};
