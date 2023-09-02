"use client"
import { Web3Modal } from '@web3modal/react'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { sepolia, polygonMumbai, avalancheFuji } from 'wagmi/chains'
import { SnackbarProvider } from 'notistack';

const chains = [sepolia, polygonMumbai, avalancheFuji];
const projectId = process.env.PROJECT_ID ?? (() => { throw new Error("PROJECT_ID is not defined"); })();

const { publicClient, webSocketPublicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, chains }),
    publicClient,
    webSocketPublicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

interface WagmiProviderProps {
    children: React.ReactNode
}

export default function WagmiProvider({
    children
}: WagmiProviderProps) {
    return (
        <>
            <SnackbarProvider maxSnack={3}>
                <WagmiConfig config={wagmiConfig}>
                    {children}
                    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} themeMode='light' />
                </WagmiConfig>
            </SnackbarProvider>
        </>
    )
}