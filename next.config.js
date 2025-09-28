/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
};

// Only apply PWA in production builds (not with Turbopack)
if (process.env.NODE_ENV === 'production') {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: false,
    buildExcludes: [/middleware-manifest\.json$/],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
          }
        }
      }
    ]
  });
  
  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}
