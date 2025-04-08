/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Configurer webpack pour gérer les modules natifs
    config.externals = [...config.externals, { 'multer': 'multer' }];
    
    // Add CSS handling configuration
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader'
      ]
    });
    
    return config;
  },
  // Transpiler multer et autres dépendances
  transpilePackages: ['multer'],
};

module.exports = nextConfig; 