import { NextRequest, NextResponse } from 'next/server';

export const middleware = (req: NextRequest) => {
  // Get the hostname
  const hostname = req.headers.get('host');

  // Get the current host depending on the envirenment
  const currentHost =
    process.env.NODE_ENV === 'production'
      ? `https://${hostname}`
      : `http://${hostname}`;

  // Get the session cookie
  const session = req.cookies['__session'] || null;

  if (session) {
    return NextResponse.rewrite(`${currentHost}/`);
  }
};
