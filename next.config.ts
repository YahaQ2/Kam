// next.config.js
const nextConfig = {
  experimental: {
    // Nonaktifkan fitur experimental jika tidak digunakan
    serverActions: false,
    optimizeCss: false,
    incrementalCacheHandlerPath: undefined
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  staticPageGenerationTimeout: 3600,
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false
}

module.exports = nextConfig