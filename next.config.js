/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        PROJECT_ID: process.env.PROJECT_ID,
        POLYBASE_PUBLIC_KEY: process.env.POLYBASE_PUBLIC_KEY,
        POLYBASE_PRIVATE_KEY: process.env.POLYBASE_PRIVATE_KEY
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'uploads-ssl.webflow.com'
            }
        ]
    }
}

module.exports = nextConfig
