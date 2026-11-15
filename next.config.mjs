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
  // A private dashboard: never framed, never sniffed, never indexed.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
