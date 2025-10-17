/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['auth.paiecashplay.com'],
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: {
          minChunks: 1,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
    return config
  }
}

module.exports = nextConfig