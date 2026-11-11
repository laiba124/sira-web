import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Send "/" to the dashboard before anything renders. Redirecting from inside
  // the Home page made React's dev timing log fail with a negative timestamp.
  redirects() {
    return [{ source: "/", destination: "/dashboard", permanent: false }];
  },
};

export default nextConfig;
