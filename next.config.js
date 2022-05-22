/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.dicebear.com',
      'media.giphy.com',
      'firebasestorage.googleapis.com',
      'pbs.twimg.com',
      'avatars.githubusercontent.com'
    ],
  },
};

module.exports = nextConfig;
