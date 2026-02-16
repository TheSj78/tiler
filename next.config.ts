// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   output: 'export',
//   reactCompiler: true,
//   basePath: '/tiler', 
//   images: {
//     unoptimized: true,
//   }
// };

// export default nextConfig;
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'tiler';

const nextConfig: NextConfig = {
  output: 'export',
  
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',

  images: {
    unoptimized: true,
  },
};

export default nextConfig;