import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { ReactElement, ReactNode, useEffect } from 'react';
import { useUserData } from 'hooks/use-user-data';
import { UserContext } from 'context/context';
import { Toast } from '@components/utils/toast';
import { reactIfSessionChanged } from '@lib/session';
import { useUsername } from 'hooks/user-username';
import { analytics } from 'config/firebase';
import { logEvent, setCurrentScreen } from 'firebase/analytics';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { ProgressBar } from '@components/utils/progress';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const { user, username, validating } = useUserData();
  const { mutate } = useUsername();

  const router = useRouter();

  const getLayout = Component.getLayout ?? ((page) => page);

  // Listen for session changes
  useEffect(() => {
    reactIfSessionChanged(validating, user, username, mutate);
  }, [user, username, validating, mutate]);

  // Analytics
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const logEvenet = (url: string) => {
        setCurrentScreen(analytics(), url);
        logEvent(analytics(), 'screen_view');
      };

      router.events.on('routeChangeComplete', logEvenet);

      // For the landing page
      logEvenet(window.location.pathname);

      // Remove event listner after unmount
      return () => {
        router.events.off('routeChangeComplete', logEvenet);
      };
    }
  });

  return (
    <UserContext.Provider
      value={{
        user,
        username,
        validating,
      }}
    >
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit"
      />
      <ProgressBar />
      {getLayout(<Component {...pageProps} />)}
      <Toast />
    </UserContext.Provider>
  );
};

export default MyApp;
