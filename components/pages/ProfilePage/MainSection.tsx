import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react'
import { Stack } from '@mui/material'
import { useAccount } from 'wagmi';
import { Icon } from '@iconify/react';
import useCollection from '@/hooks/useCollection';
import { usePathname, useRouter } from 'next/navigation';
import useDrop from '@/hooks/useDrop';
import { useString } from '@/hooks/useString';
import { NetworkList } from '@/constants/main';
import useIPFS from '@/hooks/useIPFS';

const ModelViewer = dynamic(() => import("@/components/widgets/ModelViewer"), { ssr: false });

export default function MainSection() {
    const [isLoading, setIsLoading] = useState(false);
    const [ownerIcon, setOwnerIcon] = useState<string>('solar:copy-outline');
    const [walletAddress, setWalletAddress] = useState<string | undefined>();
    const [collectionData, setCollectionData] = useState<any[]>();
    const [nftData, setNFTData] = useState<any[]>([]);
    const [dropData, setDropData] = useState<any[]>([]);
    const [collecterData, setCollecterData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<number>(0);

    const { address } = useAccount();
    const router = useRouter();
    const pathname = usePathname();
    const {
        getCollectionData,
        getNFTData
    } = useCollection();
    const {
        getDropData,
        getCollecterData
    } = useDrop();
    const { get3DImageLink } = useIPFS();
    const { L } = useString();

    const handleCopyAddress = (address: string) => {
        if (!address) return;
        navigator.clipboard.writeText(address)
        const defaultIcons = ownerIcon
        setOwnerIcon('ic:round-check')
        setTimeout(() => {
            setOwnerIcon(defaultIcons)
        }, 1500)
    }

    const getTotalSum = (numArray: number[]) => {
        return numArray.reduce((beforeValue, currentValue) => beforeValue + currentValue, 0)
    }

    const fetchCollectionData = async (address: string) => {
        try {
            if (!address) return;
            const collectionData = await getCollectionData();
            const nftData = await getNFTData();

            if (!collectionData || !nftData) return;
            const matchCollections = collectionData.filter((item: any) => L(item.wallet) === L(address))
            const matchNFTs = nftData.filter((item: any) => L(item.ownerAddress) === L(address))
            setCollectionData(matchCollections)
            setNFTData(matchNFTs)
        } catch (err) {
            console.log(err)
        }
    }

    const fetchDropData = async (address: string) => {
        try {
            if (!address) return;
            const dropData = await getDropData();
            const collecterData = await getCollecterData();

            if (!dropData || !collecterData) return;
            const matchDrop = dropData.filter((item: any) => L(item.royalReceiver) === L(address))
            const matchCollecter = collecterData.filter((item: any) => L(item.collecter) === L(address))

            const collecterDatas: any[] = []
            for (const collecter of matchCollecter) {
                if (getTotalSum(collecter.amount) > 0) {
                    const baseData = matchDrop.find(item => item.id === collecter.dropId)
                    if (baseData) {
                        const imageURL = await get3DImageLink(baseData.baseURI)

                        collecterDatas.push({
                            ...collecter,
                            name: baseData.title,
                            symbol: baseData.symbol,
                            price: baseData.pricePerToken,
                            imageURL: imageURL,
                            contractAddress: baseData.contractAddress
                        })
                    }
                }
            }

            setCollecterData(collecterDatas)
            setDropData(matchDrop)
        } catch (err) {
            console.log(err)
        }
    }

    const initialLoading = async () => {
        if (!address) return;
        setIsLoading(true)
        const walletAddress = pathname.slice(1, pathname.length)
        setWalletAddress(walletAddress);
        await fetchCollectionData(walletAddress);
        await fetchDropData(walletAddress);
        setIsLoading(false);
    }

    useEffect(() => {
        initialLoading();
    }, [address, pathname])

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
            ) : (walletAddress && collectionData && dropData) && (
                <Stack className="max-w-7xl w-full relative">
                    <div className='flex flex-col items-center w-full gap-2 mt-5'>
                        <div className="avatar">
                            <div className="w-24 mask mask-hexagon">
                                <img src={`https://web3-images-api.kibalabs.com/v1/accounts/${walletAddress}/image`} alt='user avatar' draggable={false} />
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className='badge badge-outline badge-info badge-lg cursor-pointer text-sm sm:text-base' onClick={() => handleCopyAddress(walletAddress)}>{walletAddress}</div>
                            <div className='badge badge-outline badge-info badge-lg cursor-pointer text-sm sm:text-base' onClick={() => handleCopyAddress(walletAddress)}><Icon icon={ownerIcon} className='text-sky-500' /></div>
                        </div>
                    </div>
                    <div className='divider' />
                    <div className="tabs">
                        {['Collections', 'NFTs', 'Drops', 'Claimed Drops'].map((item, index) => (
                            <a key={item} className={`tab tab-lg tab-lifted ${index === activeTab ? "tab-active" : ''}`} onClick={() => setActiveTab(index)}>{item}</a>
                        ))}
                    </div>
                    {activeTab === 0 && <div className='my-2'>
                        <div className="mockup-browser border border-rose-300 bg-rose-100 my-2">
                            <div className="mockup-browser-toolbar">
                                <div className='text-rose-500 font-medium text-end w-full'>{collectionData.length} Collections</div>
                            </div>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-6 bg-rose-50'>
                                {(collectionData && collectionData.length > 0) ? collectionData.map((item: any) => (
                                    <div className='card card-compact w-full bg-base-100 shadow-xl border border-sky-rose/50' key={item.id}>
                                        <div className='card-body'>
                                            <div className='flex items-center justify-between gap-2'>
                                                <div className='text-xl text-rose-500 font-semibold'>{item.collectionName}</div>
                                                <div className='flex items-center gap-2'>
                                                    <div className='badge badge-outline badge-error badge-sm'>{item.symbol}</div>
                                                    <div className={`badge badge-outline ${item.isPublic ? 'badge-success' : 'badge-error'}`}>{item.isPublic ? 'Public' : 'Private'}</div>
                                                </div>
                                            </div>
                                            <div className='flex flex-wrap gap-3 items-center text-gray-800 font-semibold'>
                                                Deployed on
                                                {item.deployedNetwork.map((itemNetwork: number) => (
                                                    <img src={NetworkList.find(network => network.id === itemNetwork)?.image} width={25} height={25} draggable={false} key={itemNetwork} />
                                                ))}
                                            </div>
                                            <button className="btn btn-block btn-error btn-sm text-white mt-3" onClick={() => router.push(`/nft/${item.id}`)}>
                                                Show details
                                                <Icon icon="ic:twotone-info" fontSize={20} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="alert alert-warning">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <span>Currently, there are no collections available for purchase!</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>}
                    {activeTab === 1 && <div className='my-2'>
                        <div className="mockup-browser border border-lime-300 bg-lime-100 my-2">
                            <div className="mockup-browser-toolbar">
                                <div className='text-lime-500 font-medium text-end w-full'>{nftData.length} NFTs</div>
                            </div>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-6 bg-lime-50'>
                                {(nftData && nftData.length > 0) ? nftData.map((item: any) => (
                                    <div className='card card-compact w-full bg-base-100 shadow-xl border border-lime-500/50' key={item.id}>
                                        <figure className='relative'>
                                            <ModelViewer prevURL={item.imageURL} bgColor='#ecfccb' />
                                            <div className='badge badge-success text-white badge-sm absolute bottom-3 right-3'>{item.supply}</div>
                                        </figure>
                                        <div className='card-body'>
                                            <div className='flex justify-between items-center'>
                                                <div className='flex items-center gap-1'>
                                                    <div className='text-xl text-lime-500 font-semibold'>{item.nftName}</div>
                                                    <div className='badge badge-outline badge-sm text-gray-600'>#{item.tokenId}</div>
                                                </div>
                                                <div className='badge badge-outline badge-success badge-sm'>{item.symbol}</div>
                                            </div>
                                            <div className='flex flex-wrap gap-3 items-center text-gray-800 font-semibold'>
                                                Minted on
                                                <img src={item.networkImage} width={25} height={25} draggable={false} />
                                            </div>
                                            <button className="btn btn-block btn-success btn-sm text-white mt-3" onClick={() => router.push(`/nftDetail/${item.contractAddress}/${item.network}/${item.tokenId}/${item.ownerAddress}`)}>
                                                Show details
                                                <Icon icon="ic:twotone-info" fontSize={20} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="alert alert-warning">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <span>Currently, there are no nfts available for purchase!</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>}
                    {activeTab === 2 && <div className='my-2'>
                        <div className="mockup-browser border border-violet-300 bg-violet-100 my-2">
                            <div className="mockup-browser-toolbar">
                                <div className='text-violet-500 font-medium text-end w-full'>{dropData.length} Drops</div>
                            </div>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-6 bg-violet-50'>
                                {(dropData && dropData.length > 0) ? dropData.map((item: any) => (
                                    <div className='card card-compact w-full bg-base-100 shadow-xl border border-violet-500/50' key={item.id}>
                                        <figure className='relative'>
                                            <ModelViewer prevURL={item.imageURL} bgColor='#ede9fe' />
                                            <div className='badge badge-primary text-white badge-sm absolute bottom-3 right-3'>{getTotalSum(item.buyedAmount)}</div>
                                        </figure>
                                        <div className='card-body'>
                                            <div className='flex justify-between items-center'>
                                                <div className='flex items-center gap-1'>
                                                    <div className='text-xl text-violet-500 font-semibold'>{item.title}</div>
                                                    <div className='badge badge-outline badge-sm text-gray-600'>{item.pricePerToken === 0 ? 'Free' : item.pricePerToken}</div>
                                                </div>
                                                <div className='badge badge-outline badge-primary badge-sm'>{item.symbol}</div>
                                            </div>
                                            <div className='flex flex-wrap gap-3 items-center text-gray-800 font-semibold'>
                                                Deployed on
                                                {item.network.map((itemNetwork: string) => (
                                                    <img src={NetworkList.find(network => network.network === itemNetwork)?.image} width={25} draggable={false} alt='network' key={itemNetwork} />
                                                ))}
                                            </div>
                                            <button className="btn btn-block btn-primary btn-sm text-white mt-3" onClick={() => router.push(`/drop?address=${item.contractAddress}`)}>
                                                Show details
                                                <Icon icon="ic:twotone-info" fontSize={20} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="alert alert-warning">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <span>Currently, there are no drops available for purchase!</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>}
                    {activeTab === 3 && <div className='my-2'>
                        <div className="mockup-browser border border-sky-300 bg-sky-100 my-2">
                            <div className="mockup-browser-toolbar">
                                <div className='text-sky-500 font-medium text-end w-full'>{collecterData.length} Claimed drops</div>
                            </div>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-6 bg-sky-50'>
                                {(collecterData && collecterData.length > 0) ? collecterData.map((item: any) => (
                                    <div className='card card-compact w-full bg-base-100 shadow-xl border border-sky-500/50' key={item.id}>
                                        <figure className='relative'>
                                            <ModelViewer prevURL={item.imageURL} />
                                            <div className='badge badge-info text-white badge-sm absolute bottom-3 right-3'>{getTotalSum(item.amount)}</div>
                                        </figure>
                                        <div className='card-body'>
                                            <div className='flex justify-between items-center'>
                                                <div className='flex items-center gap-1'>
                                                    <div className='text-xl text-sky-500 font-semibold'>{item.name}</div>
                                                    <div className='badge badge-outline badge-sm text-gray-600'>{item.price === 0 ? 'Free' : item.price}</div>
                                                </div>
                                                <div className='badge badge-outline badge-info badge-sm'>{item.symbol}</div>
                                            </div>
                                            <div className='flex flex-wrap gap-3 items-center text-gray-800 font-semibold'>
                                                Claimed on
                                                <img src={NetworkList.find(network => network.id === item.network)?.image} width={25} draggable={false} alt='network' />
                                            </div>
                                            <button className="btn btn-block btn-info btn-sm text-white mt-3" onClick={() => router.push(`/dropDetail/${item.contractAddress}/${item.network}/${item.claimId[0]}/${item.collecter}`)}>
                                                Show details
                                                <Icon icon="ic:twotone-info" fontSize={20} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="alert alert-warning">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <span>Currently, there are no available drops available for purchase!</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>}
                </Stack>
            )}
        </Stack>
    )
}
