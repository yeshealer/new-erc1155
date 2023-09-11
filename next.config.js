/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        PROJECT_ID: process.env.PROJECT_ID,
        POLYBASE_PUBLIC_KEY: process.env.POLYBASE_PUBLIC_KEY,
        POLYBASE_PRIVATE_KEY: process.env.POLYBASE_PRIVATE_KEY,
        FACTORY_CONTRACT: process.env.FACTORY_CONTRACT,
        REFER_CONTRACT: process.env.REFER_CONTRACT,
        PINATA_API_KEY: process.env.PINATA_API_KEY,
        PINATA_API_SECRET: process.env.PINATA_API_SECRET,
        DROP_FACTORY_CONTRACT: process.env.DROP_FACTORY_CONTRACT,
        DROP_IMPLEMENTATION_CONTRACT: process.env.DROP_IMPLEMENTATION_CONTRACT
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'uploads-ssl.webflow.com'
            }
        ]
    },
    typescript: {
        ignoreBuildErrors: true
    }
}

module.exports = nextConfig
