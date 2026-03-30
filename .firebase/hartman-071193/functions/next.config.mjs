// next.config.mjs
var nextConfig = {
  allowedDevOrigins: ["172.20.10.4"],
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  }
};
var next_config_default = nextConfig;
export {
  next_config_default as default
};
