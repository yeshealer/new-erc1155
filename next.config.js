/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        PROJECT_ID: process.env.PROJECT_ID,
        POLYBASE_PUBLIC_KEY: process.env.POLYBASE_PUBLIC_KEY,
        POLYBASE_PRIVATE_KEY: process.env.POLYBASE_PRIVATE_KEY,
        FACTORY_CONTRACT: process.env.FACTORY_CONTRACT,
        REFER_CONTRACT: process.env.REFER_CONTRACT
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
