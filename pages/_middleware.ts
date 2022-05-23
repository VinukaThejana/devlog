import { NextRequest, NextResponse } from 'next/server';

export const middleware = (req: NextRequest) => {
  // Get the current URL
  const url = req.nextUrl.clone();
  // Get the hostname
  const hostname = req.headers.get('host');
  // Get the cookies from the session
  const session = req.cookies['__session'] || '';

  const currentHost =
    process.env.NODE_ENV === 'production'
      ? `https://${hostname}`
      : `http://${hostname}`;

  // Block non authenticated users acsessing the profile page
  if (url.pathname.startsWith('/profile')) {
    if (!session) {
      return NextResponse.rewrite(`${currentHost}/login`);
    }
  }

  // Block authenticated users from acsessing the login page
  if (url.pathname.startsWith('/login')) {
    if (session) {
      return NextResponse.rewrite(`${currentHost}`);
    }
  }

  // Block authenticated users from acsessing the register page
  if (url.pathname.startsWith('/register')) {
		if (session) {
      return NextResponse.rewrite(`${currentHost}`);
		}
  }
};
