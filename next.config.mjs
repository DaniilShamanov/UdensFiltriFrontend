import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep disabled until you explicitly want to opt-in
  typedRoutes: false,
  // Useful when integrating with a Django API via a different domain
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost'
      }
    ]
  }
};

export default withNextIntl(nextConfig);
