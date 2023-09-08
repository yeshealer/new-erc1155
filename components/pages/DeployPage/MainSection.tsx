// ** react & next imports
import React, { useState, useEffect } from 'react'
import { useRouter } from "next/navigation";
// ** UI module imports
import { Icon } from "@iconify/react";
import Stack from "@mui/material/Stack";
// ** style & constants imports
import { IconButton } from "@/components/globalstyle";
import { NetworkList } from '@/constants/main';
// ** web3 imports
import { useAccount, useBalance, useSwitchNetwork, useNetwork } from 'wagmi';
// ** utils & provider & abis
import useCollection from '@/hooks/useCollection';
import { useWeb3Modal } from '@web3modal/react';

export default function MainSection() {
    const [isLoading, setIsLoading] = useState(false);
    const [collectionInfo, setCollectionInfo] = useState<any>();

    const { open } = useWeb3Modal();
    const router = useRouter();
    const { chain } = useNetwork();
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({
        address: address,
    })
    const { isLoading: switching, switchNetwork } = useSwitchNetwork();
    const {
        isDeploying,
        getCollectionData,
        deploy,
    } = useCollection();

    const pathname = location.pathname.slice(8, location.pathname.length);

    const handleDeploy = async (collectionInfo: any, chainID: number) => {
        await deploy(collectionInfo, chainID, pathname, setCollectionInfo);
    }

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true)
                const collection = await getCollectionData(pathname);
                setCollectionInfo(collection)
                setIsLoading(false)
            } catch (err) {
                console.log(err)
                setIsLoading(false)
            }
        })()
    }, [chain?.id])

    return (
        <Stack direction='row' alignItems='center' justifyContent='center' className="px-3">
            {isLoading ? (
                <Stack
                    justifyContent='center'
                    alignItems='center'
                    sx={{ minHeight: 'calc(100vh - 100px)' }}
                >
                    <span className="loading loading-bars loading-lg text-info"></span>
                </Stack>
            ) : isDeploying ? (
                <Stack
                    justifyContent='center'
                    alignItems='center'
                    sx={{ minHeight: 'calc(100vh - 100px)' }}
                >
                    <span className="loading loading-infinity w-32 text-info"></span>
                    <div className='text-sky-500 font-bold text-2xl'>Deploying...</div>
                </Stack>
            ) : (
                <Stack className="max-w-7xl w-full relative">
                    <div className="w-full flex items-center justify-between">
                        <IconButton
                            onClick={() => router.push('/create')}
                            className="absolute left-0"
                        >
                            <Icon icon="solar:undo-left-bold" fontSize={20} />
                        </IconButton>
                        <p className={`text-center text-3xl sm:text-4xl font-bold w-full`}>Deploy Collection</p>
                    </div>
                    <div className='divider' />
                    {collectionInfo && (
                        <div className='w-full'>
                            <div>
                                <div className='badge badge-info text-white'>Collection Name</div>
                                <div className='text-2xl font-semibold'>{collectionInfo.collectionName}</div>
                                <p className='text-gray-500 text-sm'>Select a network to deploy your collection. Deploying your collection on each network is required to bridge NFTs between those networks.</p>
                            </div>
                            <div className='divider'>Deploy on the network</div>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start justify-between gap-5 pb-10'>
                                {NetworkList.map((item) => {
                                    const isDeployed = collectionInfo.deployedNetwork.includes(item.id);
                                    return (
                                        <div className='w-full' key={item.id}>
                                            <div className="mockup-window border border-base-300">
                                                <div className="flex flex-col px-6 py-4 pb-2 border-t border-base-300">
                                                    <div className='flex items-center justify-between w-full'>
                                                        <div className='flex items-center gap-4 text-xl font-semibold'>
                                                            <img src={item.image} alt="network icon" width={30} height={30} draggable={false} />
                                                            {item.network}
                                                        </div>
                                                        {isDeployed ? <span className="badge badge-accent text-white">Deployed</span> : switching ? <span></span> : <span className="badge">Not live</span>}
                                                    </div>
                                                    {item.id === chain?.id ? (
                                                        <div className='text-gray-500 text-sm flex items-center justify-between w-full mt-3'>
                                                            <div className='px-2'>
                                                                Balance: {Number(balance?.formatted).toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 0 })} {item.currency}
                                                            </div>
                                                            <div className="badge badge-info badge-sm text-white gap-2">
                                                                Connected
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button className={`btn btn-xs btn-block btn-info btn-outline mt-2`} onClick={() => switchNetwork?.(item.id)}>
                                                            {switching && <span className="loading loading-spinner"></span>}
                                                            {switching ? '' : 'Switch Network'}
                                                        </button>
                                                    )}
                                                </div>
                                                <div className='divider my-0' />
                                                <div className='px-6 py-2 pt-0'>
                                                    {!isConnected ? (
                                                        <button className="btn btn-sm btn-block btn-info text-white" onClick={open}>Connect Wallet</button>
                                                    ) : isDeployed ? (
                                                        <button className="btn btn-sm btn-block btn-accent text-white" onClick={() => window.open(`${NetworkList.find(network => network.id === item.id)?.explorer}${collectionInfo.deployedAddress}`)}>
                                                            {collectionInfo.deployedAddress.slice(0, 5) + '...' + collectionInfo.deployedAddress.slice(-5)}
                                                            <Icon icon="tabler:external-link" fontSize={18} />
                                                        </button>
                                                    ) : (
                                                        <button className="btn btn-sm btn-block btn-info text-white" onClick={async () => await handleDeploy(collectionInfo, item.id)}>Deploy</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </Stack>
            )}
        </Stack>
    )
}
