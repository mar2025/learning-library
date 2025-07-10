module.exports = {
  globDirectory: 'workshops/common-content',
  globPatterns: [
    'js/workshop.bundle.js',
    'css/site.min.css',
    'images/**/*.{webp,svg}',
    '**/*.html'
  ],
  swDest: 'workshops/common-content/sw.js',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|webp|svg)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
        }
      }
    },
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources'
      }
    }
  ]
};