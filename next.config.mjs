import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable experimental features that might cause OneDrive issues
  experimental: {
    optimizeCss: false,
  },
  
  // Configure images for external domains (Cloudinary)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Disable file system watching to prevent OneDrive sync issues
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules|\.next/,
      }
    }
    
    // Disable some features that can cause permission issues
    if (isServer) {
      config.cache = false
    }
    
    return config
  },
  
  // Add output file tracing root to silence warning
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
