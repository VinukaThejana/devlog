import { HomeIcon } from '@heroicons/react/solid';
import { auth } from 'config/firebase';
import { useUserContext } from 'context/context';
import { signOut } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authEncoded } from '@lib/session';

const Navbar = () => {
  const { user, username, validating } = useUserContext();
  const router = useRouter();

  return (
    <nav className="bg-gray-800 text-center lg:text-left py-6 px-4 border-b border-slate-700 w-screen">
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <div className="hidden sm:flex px-2 text-xl">
          <Link href="/">devlog</Link>
        </div>

        {!validating ? (
          <div className="flex flex-col items-center justify-center">
            {!user ? (
              <div className="flex flex-col">
                <div className="flex flex-row items-center justify-center">
                  <Link href="/">
                    <a className="sm:hidden font-bold ml-4 mr-16">devlog</a>
                  </Link>
                  <Link href="/login">
                    <a className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-8 rounded-full mx-2">
                      Login
                    </a>
                  </Link>
                  <Link href="/register">
                    <a className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-8 rounded-full mx-2">
                      Register
                    </a>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-row justify-between items-between gap-8">
                <Link href="/" passHref>
                  <HomeIcon className="w-9 h-9 sm:hidden" />
                </Link>

                <div className="flex items-center justify-center">
                  <Link href="/admin">
                    <a className="bg-gray-800 hover:bg-gray-900 text-white text-sm sm:text-base font-bold py-2 px-4 rounded-full">
                      Write Posts
                    </a>
                  </Link>
                  <Link href="/profile">
                    <a className="bg-gray-800 hover:bg-gray-900 text-white text-sm sm:text-base font-bold py-2 px-4 rounded-full">
                      profile
                    </a>
                  </Link>
                  <button
                    className="hidden sm:flex bg-gray-800 hover:bg-gray-900 text-white text-sm sm:text-base font-bold py-2 px-4 ml-2 rounded-full"
                    onClick={async () => {
                      await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                          Authorization: `Basic ${authEncoded}`,
                          'Content-Type': 'application/json',
                        },
                      });
                      await signOut(auth());
                      router.push('/');
                    }}
                  >
                    Sign Out
                  </button>
                  <Image
                    src={
                      auth().currentUser?.photoURL ||
                      `https://avatars.dicebear.com/api/adventurer/${user.uid}.svg`
                    }
                    alt={user.displayName || 'profile picture'}
                    width={50}
                    height={50}
                    className="rounded-full"
                    onClick={() => router.push(`/${username}`)}
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </nav>
  );
};

export { Navbar };
