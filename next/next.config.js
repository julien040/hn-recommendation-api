/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: "www.google.com",
        protocol: "https",
        pathname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
