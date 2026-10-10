/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: the whole site becomes plain HTML/CSS/JS in ./out.
  // Nothing to run on a server, nothing to pay for, deployable anywhere.
  output: "export",
  trailingSlash: true,
  images: {
    // Required for `output: export`. Photos are already sized at source.
    unoptimized: true,
  },
  poweredByHeader: false,
};
export default nextConfig;
