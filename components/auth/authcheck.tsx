import { Loader } from '@components/utils/loader';
import { useUserContext } from 'context/context';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

export const AuthCheck = (props: {
  children: JSX.Element[];
  fallback: ReactNode;
}) => {
  const { user, validating } = useUserContext();

  const Authenticate = () => {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <Image
          src={'https://media.giphy.com/media/L1QTSCW1S7qutb2XCD/giphy.gif'}
          alt={'Please login'}
          width={300}
          height={300}
        />
        <Link href="/login">
          <a className="text-3xl text-center mt-8">Login</a>
        </Link>
        <p className="text-2xl">or</p>
        <Link href="/register">
          <a className="text-3xl text-center">Register</a>
        </Link>
      </div>
    );
  };

  return !validating ? (
    <>{user ? props.children : props.fallback || <Authenticate />}</>
  ) : (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader show={validating} />
    </div>
  );
};
