/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 180
    }
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      },
      {
        protocol: "http",
        hostname: "**"
      }
    ]
  },
  // experimental: {
  //   missingSuspenseWithCSRBailout: false,
  // },
  async redirects() {
    return [
      {
        source: "/profile/shops/:id",
        destination: "/profile/shops/:id/dashboard",
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;
