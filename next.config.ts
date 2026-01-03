// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},

	outputFileTracingIncludes: {
		"*": ["./node_modules/.prisma/client/**"],
	},
};

export default nextConfig;
