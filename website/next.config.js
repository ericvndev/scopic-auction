/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	swcMinify: true,
	images: {
		domains: ['localhost', 'picsum.photos'],
	},
};

module.exports = nextConfig;
