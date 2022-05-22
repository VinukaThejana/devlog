import { IPostDocument } from 'interfaces/firebase';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { BanIcon, GlobeIcon } from '@heroicons/react/solid';

// Get the average reading time of an post
const getPostReadingTime = (postContent: string) => {
  const TIME_SPENT_BY_AN_AVERAGE_HUMAN_TO_READ_A_WORD_IN_MILISECONDS = 3600;

  const words = postContent.split(' ');
  const totalWords = words.length;

  // Time spend to read the given article in miliseconds
  const timeTaken =
    totalWords * TIME_SPENT_BY_AN_AVERAGE_HUMAN_TO_READ_A_WORD_IN_MILISECONDS;
  // convert that timeTaken to minutes
  const timeTakenInMinutes = Math.floor(timeTaken / (1000 * 60)).toString();

  return timeTakenInMinutes;
};

export const PostCard = (props: {
  posts: IPostDocument[];
  admin?: boolean;
}) => {
  const { posts, admin } = props;

  // Get the post slug depending on the permission level
  const getURL = (index: number) => {
    if (admin) {
      return `/admin/${posts[index].slug}`;
    } else {
      return `/${posts[index].username}/${posts[index].slug}`;
    }
  };

  // Get the created Date of the post
  const getDate = (index: number) => {
    const time =
      typeof posts[index].createdAt === 'number'
        ? Timestamp.fromMillis((posts[index] as any).createdAt)
        : posts[index].createdAt;
    return (time as unknown as Timestamp)?.toDate().toDateString();
  };

  return posts ? (
    <div className="flex flex-col items-center justify-center mt-8">
      <>
        {posts.map((post: IPostDocument, index: number) => (
          <Link href={getURL(index)} key={index} passHref>
            <div className="border border-solid border-slate-600 rounded-lg shadow-lg relative flex flex-col w-fit md:w-[700px] lg:w-[800px] outline-none focus:outline-none px-2 py-4 mt-4 cursor-pointer">
              <div className="flex flex-col sm:flex-row items-start justify-between p-5 border-solid border-b border-slate-500 rounded-t">
                <h1 className="text-lg">{post.title}</h1>
                <h1 className="text-lg">{getDate(index)}</h1>
              </div>
              <div className="flex flex-col items-center justify-center mt-8 break-words px-2">
                <ReactMarkdown>{post.summary}</ReactMarkdown>
              </div>
              <div className="flex justify-between p-5 mt-8">
                Time to read: {getPostReadingTime(post.content)} minutes
                {admin ? (
                  <>
                    {post.published ? (
                      <GlobeIcon className="w-6 h-6 text-green-700" />
                    ) : (
                      <BanIcon className="w-6 h-6 text-red-700" />
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </>
    </div>
  ) : null;
};
