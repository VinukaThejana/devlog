import { ReactElement, useState } from 'react';
import { ProviderTypes } from '@components/auth/providers';
import { Email } from '@components/auth/email';
import { Layout } from '@components/layout/layout';
import { Loader } from '@components/utils/loader';

const Login = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [hideProviders, setHideProviders] = useState<boolean>(false);

  return !loading ? (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <main className="flex flex-col items-center justify-center p-20">
        <div className="flex flex-col items-center justfiy-center pt-10">
          <Email
            register={false}
            setHideProviders={setHideProviders}
            setLoading={setLoading}
          />
          {!hideProviders ? (
            <>
              <h1 className="text-4xl font-bold mt-8 mb-8">Or</h1>
              <ProviderTypes register={false} setLoading={setLoading} />
            </>
          ) : null}
        </div>
      </main>
    </div>
  ) : (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Loader show={loading} />
    </main>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Login;
