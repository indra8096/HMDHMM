/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Configurer webpack pour gérer les modules natifs
    config.externals = [...config.externals, { 'multer': 'multer' }];
    return config;
  },
  // Transpiler multer et autres dépendances
  transpilePackages: ['multer'],
};

module.exports = nextConfig; 