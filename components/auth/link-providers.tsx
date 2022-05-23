import { UserInfo } from 'firebase/auth';
import { ProviderTypes } from 'interfaces/firebase';
import { LinkButtons } from './link-buttons';

export const LinkProviders = (props: { providerData: UserInfo[] }) => {
  const { providerData } = props;

  const providers = ['password', 'google.com', 'github.com', 'twitter.com'];

  const linkedProviders: string[] = [];
  let unLinkedProviders: string[] = [];

  providerData.forEach((provider) => {
    linkedProviders.push(provider.providerId);
  });

  unLinkedProviders = [...providers].filter(
    (x) => !new Set(linkedProviders).has(x)
  );

  const showIfNoEmailProviderLink =
    linkedProviders.length === 1 && linkedProviders[0] === 'password';
  const showIfNoEmailProviderUnLink =
    unLinkedProviders.length === 1 && unLinkedProviders[0] === 'password';

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {linkedProviders.length !== 0 && !showIfNoEmailProviderLink && (
        <>
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl">Linked accounts</h1>
            <>
              {linkedProviders.map((provider: string, index: number) => {
                return (
                  <LinkButtons
                    key={index}
                    index={index}
                    provider={provider as ProviderTypes}
                    link={false}
                  />
                );
              })}
            </>
          </div>
        </>
      )}

      {unLinkedProviders.length !== 0 && !showIfNoEmailProviderUnLink && (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl">Link accounts</h1>
          <>
            {unLinkedProviders.map((provider: string, index: number) => {
              return (
                <LinkButtons
                  key={index}
                  index={index}
                  provider={provider as ProviderTypes}
                  link={true}
                />
              );
            })}
          </>
        </div>
      )}
    </div>
  );
};
