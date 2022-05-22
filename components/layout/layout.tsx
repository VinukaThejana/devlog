import { FunctionComponent, ReactNode } from 'react';
import { Footer } from './footer';
import { Navbar } from './navbar';

export const Layout: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};
