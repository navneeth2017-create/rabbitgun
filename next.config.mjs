/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The Vault stores files outside the app. Larger uploads go through the
  // worker, not a server action body.
  experimental: {
    serverActions: { bodySizeLimit: "25mb" },
  },
  // onnxruntime ships native binaries — keep them out of the bundler.
  serverExternalPackages: ["@xenova/transformers", "onnxruntime-node"],
};

export default nextConfig;
