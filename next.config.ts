// next.config.js
const nextConfig = {
  experimental: {
    // Server Actions harus berupa object konfigurasi
    serverActions: {
      allowedOrigins: [], // Tambahkan domain yang diizinkan jika diperlukan
    },
    
    // Hapus properti yang tidak dikenali:
    // - incrementalCacheHandlerPath 
    // - optimizeCss (jika tidak digunakan)
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  staticPageGenerationTimeout: 3600,
  swcMinify: false, // Pindahkan ke root config
  compress: true,
  productionBrowserSourceMaps: false
}

module.exports = nextConfig