import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation';
import Stack from '@mui/material/Stack'
import { IconButton } from '@/components/globalstyle';
import { Icon } from '@iconify/react';
// import useNetwork from '@/hooks/useNetwork';
import useCollection from '@/hooks/useCollection';
import { useAccount, useNetwork } from 'wagmi';
import { Player } from '@lottiefiles/react-lottie-player';
import { NetworkList } from '@/constants/main';
import ModelViewer from '@/components/widgets/ModelViewer';

export default function MainSection() {
    const router = useRouter();
    const { chain } = useNetwork();
    const { address } = useAccount();
    const {
        getCollectionData,
        getNFTData
    } = useCollection();
    const pathname = usePathname();

    const [isLoading, setIsLoading] = useState(false);
    const [collectionInfo, setCollectionInfo] = useState<any>();
    const [nftInfo, setNFTInfo] = useState<any>();

    const pathName = pathname.slice(5, pathname.length)

    const handleCopyAddress = (address: string) => {
        navigator.clipboard.writeText(address)
    }

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true)
                const collection = await getCollectionData(pathName);
                setCollectionInfo(collection);
            } catch (err) {
                console.log(err)
                setIsLoading(false)
            }
        })()
    }, [chain?.id])

    useEffect(() => {
        if (collectionInfo) {
            (async () => {
                try {
                    setIsLoading(true)
                    const nft = await getNFTData(collectionInfo);
                    setNFTInfo(nft);
                    setIsLoading(false)
                } catch (err) {
                    console.log(err)
                }
            })()
        }
    }, [collectionInfo])

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
                        <Stack className='w-full' direction={{ sm: 'column', md: 'row' }} justifyContent='space-between' alignItems='center'>
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
                                                    <img src={NetworkList.find((network: any) => network.id === networkId)?.image} alt="network icon" width={24} height={24} className="mr-2 h-max" draggable={false} key={networkId} />
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
                            {(collectionInfo.deployedNetwork.length > 0 && collectionInfo.deployedNetwork.includes(chain?.id)) && (
                                <button className={`btn btn-info text-white w-full sm:w-auto mt-4 sm:mt-0`} onClick={() => router.push(`/nft/${collectionInfo.id}/mint`)}>
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
                                {(collectionInfo && collectionInfo.deployedNetwork.length > 0 && collectionInfo.deployedNetwork.includes(chain?.id)) && (
                                    <button className={`btn btn-info text-white`} onClick={() => router.push(`/nft/${collectionInfo.id}/mint`)}>
                                        Create NFT
                                    </button>
                                )}
                            </Stack>
                        ) : (nftInfo && nftInfo.length > 0) && (
                            <Stack direction='row' justifyContent='space-between' flexWrap='wrap' gap={4}>
                                {nftInfo.map((item: any) => {
                                    return (
                                        <div className="card card-compact w-96 bg-base-100 shadow-xl" key={item.nftName + item.tokenId}>
                                            <figure className='relative'>
                                                <ModelViewer prevURL={item.imageURL} />
                                                <div className="badge badge-info badge-lg text-white font-semibold absolute left-2 top-2">
                                                    {item.nftName} #{item.tokenId}
                                                </div>
                                                <div className="badge badge-sm absolute right-2 bottom-2">{item.supply}</div>
                                                <img src={NetworkList.find(network => network.id === item.network)?.image} alt='network image' className='absolute right-2 top-2' width={24} height={24} />
                                            </figure>
                                            <div className="card-body">
                                                <div>
                                                    <div className='badge badge-sm mr-2'>Description</div>
                                                    <span>{item.nftDescription}</span>
                                                </div>
                                                <div className='relative flex items-center gap-2 flex-wrap'>
                                                    <div className='badge badge-sm mr-2'>Contract Address</div>
                                                    <span className="cursor-pointer" onClick={() => window.open(`${NetworkList.find(network => network.id === item.network)?.explorer}${item.contractAddress}`)}>{item.contractAddress.slice(0, 7)}...{item.contractAddress.slice(-5)}</span>
                                                    <Icon icon={'solar:copy-outline'} className="cursor-pointer" onClick={() => handleCopyAddress(item.contractAddress)} />
                                                </div>
                                                <div className='relative flex items-center gap-2 flex-wrap'>
                                                    <div className='badge badge-sm mr-2'>Owner Address</div>
                                                    <span className="cursor-pointer" onClick={() => window.open(`${NetworkList.find(network => network.id === item.network)?.explorer}${item.ownerAddress}`)}>{item.ownerAddress.slice(0, 7)}...{item.ownerAddress.slice(-5)}</span>
                                                    <Icon icon={'solar:copy-outline'} className="cursor-pointer" onClick={() => handleCopyAddress(item.ownerAddress)} />
                                                </div>
                                                <div>
                                                    <div className='badge badge-sm mr-2'>Token Id</div>
                                                    <span>{item.tokenId}</span>
                                                </div>
                                                <div>
                                                    <div className='badge badge-sm mr-2'>Symbol</div>
                                                    <span>{item.symbol}</span>
                                                </div>
                                                <div>
                                                    <div className='badge badge-sm mr-2'>Chain</div>
                                                    <span>{NetworkList.find(network => network.id === item.network)?.network}</span>
                                                </div>
                                                <div>
                                                    <div className='badge badge-sm mr-2'>Last Synced</div>
                                                    <span>{item.lastSynced}</span>
                                                </div>
                                                {/* <button className="btn btn-block btn-info btn-sm text-white" onClick={() => router.push(`/nftdetail/${item.contractAddress}/${item.network}/${item.tokenId}/${item.ownerAddress}`)}> */}
                                                <button className="btn btn-block btn-info btn-sm text-white">
                                                    Show details
                                                    <Icon icon="ic:twotone-info" fontSize={20} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            )}
        </Stack>
    )
}
