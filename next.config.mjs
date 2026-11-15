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
      { source: '/recel.html', destination: '/recel' },
      { source: '/exitorecel.html', destination: '/exitorecel' },
      { source: '/trans.html', destination: '/trans' },
      { source: '/exitotrans.html', destination: '/exitotrans' },
      { source: '/cotras.html', destination: '/cotras' },
      { source: '/exitocotras.html', destination: '/exitocotras' },
      { source: '/sobre.html', destination: '/sobre' },
    ];
  },
};

export default nextConfig;
