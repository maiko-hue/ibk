/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/index', destination: '/' },
      { source: '/index.html', destination: '/' },
      { source: '/login_pin.html', destination: '/login_pin' },
      { source: '/inicio.html', destination: '/inicio' },
      { source: '/config.html', destination: '/config' },
      { source: '/trcontac.html', destination: '/trcontac' },
      { source: '/infoc.html', destination: '/infoc' },
      { source: '/serv.html', destination: '/serv' },
      { source: '/exitoserv.html', destination: '/exitoserv' },
    ];
  },
};

export default nextConfig;
