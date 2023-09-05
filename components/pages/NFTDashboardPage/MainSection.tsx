import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import Stack from '@mui/material/Stack'
import { IconButton } from '@/components/globalstyle';
import { Icon } from '@iconify/react';
import useNetwork from '@/hooks/useNetwork';
import useCollection from '@/hooks/useCollection';
import { useAccount } from 'wagmi';
import { Player } from '@lottiefiles/react-lottie-player';
import { NetworkList } from '@/constants/main';

export default function MainSection() {
    const router = useRouter();
    const { chainID } = useNetwork();
    const { address } = useAccount();
    const {
        getCollectionData,
        getNFTData
    } = useCollection();

    const [isLoading, setIsLoading] = useState(false);
    const [collectionInfo, setCollectionInfo] = useState<any>();
    const [nftInfo, setNFTInfo] = useState<any>();

    const pathname = location.pathname.slice(5, location.pathname.length);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true)
                const collection = await getCollectionData(pathname);
                const nft = await getNFTData(collection);
                setCollectionInfo(collection);
                setNFTInfo(nft);
                setIsLoading(false)
            } catch (err) {
                console.log(err)
                setIsLoading(false)
            }
        })()
    }, [chainID])

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
            ) : (
                <Stack className="max-w-7xl w-full relative">
                    <Stack direction='row' alignItems='center' justifyContent='center' className="w-full relative">
                        <IconButton
                            onClick={() => router.push('/create')}
                            className='absolute left-0'
                        >
                            <Icon icon="solar:undo-left-bold" fontSize={20} />
                        </IconButton>
                        <div className="text-center text-3xl sm:text-4xl font-bold">Collection</div>
                    </Stack>
                    <div className='divider' />
                    {collectionInfo && (
                        <Stack className='w-full' direction='row' justifyContent='space-between' alignItems='center'>
                            <Stack className='w-full' direction='row' gap={4} flexWrap='wrap'>
                                <Stack justifyContent='space-between' gap={1.5}>
                                    <div className='badge badge-info text-white'>Collection Name</div>
                                    <div className='text-2xl font-semibold'>{collectionInfo.collectionName}</div>
                                </Stack>
                                <Stack justifyContent='space-between' gap={1.5}>
                                    <div className='badge badge-info text-white'>Deployed on</div>
                                    {(collectionInfo.deployedNetwork.length > 0) ? (
                                        <Stack direction={'row'} className='h-max' alignItems='center'>
                                            {collectionInfo.deployedNetwork.map((networkId: number) => {
                                                return (
                                                    <img src={NetworkList.find((network: any) => network.id === networkId)?.image} alt="network icon" width={24} height={24} className="mr-2 h-max" draggable={false} />
                                                )
                                            })}
                                            {collectionInfo.wallet === address && (
                                                <IconButton
                                                    onClick={() => router.push(`/deploy/${collectionInfo.id}`)}
                                                    className="p-1.5"
                                                >
                                                    <Icon icon="ic:round-plus" fontSize={18} />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    ) : (collectionInfo.wallet === address) ? (
                                        <button className={`btn btn-xs btn-info btn-outline`} onClick={() => router.push(`/deploy/${collectionInfo.id}`)}>
                                            DEPLOY
                                        </button>
                                    ) : (
                                        '-----'
                                    )}
                                </Stack>
                            </Stack>
                            {(collectionInfo.deployedNetwork.length > 0) && (
                                <button className={`btn btn-info text-white`} onClick={() => router.push(`/nft/${collectionInfo.id}/mint`)}>
                                    Create NFT
                                </button>
                            )}
                        </Stack>
                    )}
                    <div className='divider'>NFT details</div>
                    <Stack>
                        {(nftInfo && nftInfo.length === 0) ? (
                            <Stack alignItems='center' mt={5}>
                                <Player
                                    autoplay
                                    loop
                                    src="https://lottie.host/4d0014a5-649e-4016-83b0-3b7bedf37631/vIBTlHnxhn.json"
                                    style={{ height: '320px', width: '320px' }}
                                />
                                {(collectionInfo && collectionInfo.deployedNetwork.length > 0) && (
                                    <button className={`btn btn-info text-white`} onClick={() => router.push(`/nft/${collectionInfo.id}/mint`)}>
                                        Create NFT
                                    </button>
                                )}
                            </Stack>
                        ) : (
                            <Stack>

                            </Stack>
                        )}
                    </Stack>
                </Stack>
            )}
        </Stack>
    )
}
