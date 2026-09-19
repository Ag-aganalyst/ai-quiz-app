/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === '1';

const nextConfig = {
  // `STATIC_EXPORT=1 npm run export:static` builds a fully static demo of the UI prototype
  // (no API routes) into ./out for hosting on any static file server or CDN.
  ...(isStaticExport ? { output: 'export', trailingSlash: false, images: { unoptimized: true } } : {}),
};

export default nextConfig;
