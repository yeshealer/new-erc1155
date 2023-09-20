import dynamic from "next/dynamic";
import React, { useEffect, useState } from 'react'
import { Stack } from '@mui/material'
import useBridge from '@/hooks/useBridge';
import { NetworkList } from '@/constants/main';
import { switchNetwork } from '@wagmi/core';
import { useSnackbar } from 'notistack';
import { errorVariant } from '@/utils/stickyHelper';
import { useNetwork } from 'wagmi';
import { Player } from '@lottiefiles/react-lottie-player';
import { Icon } from '@iconify/react';
import { ZERO_ADDRESS } from '@/utils/addressHelper';

const ModelViewer = dynamic(() => import("@/components/widgets/ModelViewer"), { ssr: false });

export default function MainSection() {
    const [isDrop, setIsDrop] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dropNames, setDropNames] = useState<any[]>([]);
    const [collectionNames, setCollectionNames] = useState<any[]>([]);
    const [selectedTokenId, setSelectedTokenId] = useState<string>('');
    const [dropData, setDropData] = useState<any[]>([]);
    const [collectionData, setCollectionData] = useState<any[]>([]);
    const [availableNetworks, setAvailableNetworks] = useState<any>([]);
    const [activeCollection, setActiveCollection] = useState<any>();
    const [collectionAddress, setCollectionAddress] = useState<`0x${string}`>(ZERO_ADDRESS);
    const [networkNum, setNetworkNum] = useState(0);
    const [toNetwork, setToNetwork] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dropDetail, setDropDetail] = useState<any>();
    const [collectionDetail, setCollectionDetail] = useState<any>();
    const [modalLoading, setModalLoading] = useState(true);
    const [clickStatus, setClickStatus] = useState<boolean[]>([]);
    const [activeToken, setActiveToken] = useState<any>();
    const [selectedNFTImage, setSelectedNFTImage] = useState('');
    const [amount, setAmount] = useState<string>('');
    const [modelLoading, setModelLoading] = useState<boolean>(false);
    const [selectedCollection, setSelectedCollection] = useState('');
    const [selectedDrop, setSelectedDrop] = useState('');
    const [isBridging, setIsBridging] = useState<boolean>(false);

    const { enqueueSnackbar } = useSnackbar();
    const { chain } = useNetwork();

    const {
        getCollectionData,
        getDropData,
        selectDropActivity,
        selectCollectionActivity,
        getSpecificDropData,
        collectionBridge,
        dropBridge
    } = useBridge();

    const handleToggle = async (value: string) => {
        if (value === 'on') {
            setIsDrop(prevStats => !prevStats)
        }
    }

    const handleSelectValue = async (value: string) => {
        setModelLoading(true)
        if (isDrop) {
            setSelectedDrop(value)
            const dropData = await selectDropActivity(value)
            if (!dropData) return;
            const toNetwork = NetworkList.filter(item => (item.id !== chain?.id && dropData.networkList.includes(item.id)))[0]?.id || 0
            setDropData(dropData.dropListByID)
            setAvailableNetworks(dropData.networkList)
            setClickStatus(dropData.dropListByID.map((item: any) => false))
            setToNetwork(toNetwork)
        } else {
            setSelectedCollection(value);
            const collectionData = await selectCollectionActivity(value);
            if (!collectionData) return;
            const toNetwork = NetworkList.filter(item => (item.id !== chain?.id && !collectionData.selectedCollection?.data.deployedNetwork.includes(item.id)))[0]?.id || 0
            setActiveCollection(collectionData.selectedCollection)
            setAvailableNetworks(collectionData.selectedCollection?.data.deployedNetwork)
            setCollectionAddress(collectionData.selectedCollection?.data.deployedAddress)
            setCollectionData(collectionData.displayNFTData)
            setClickStatus(collectionData.displayNFTData.map((item: any) => false))
            setToNetwork(toNetwork)
        }
        setModelLoading(false)
    }

    const handleSelectFromNetwork = async (networkID: string) => {
        try {
            await switchNetwork({
                chainId: Number(networkID)
            }).then(res => {
                setNetworkNum(res.id)
            })
        } catch (err) {
            console.log(err)
        }
    }

    const handleSelectToNetwork = async (networkID: string) => {
        setToNetwork(Number(networkID))
    }

    const handleOpen = async (dropId: number, claimId?: number) => {
        setIsModalOpen(true);
        if (isDrop && claimId) {
            setModalLoading(true)
            const dropDetail = getSpecificDropData(dropId, claimId)
            setDropDetail(dropDetail)
            setModalLoading(true)
        } else {
            if (!collectionData) {
                enqueueSnackbar('Failed to fetch colletion data', { variant: errorVariant })
            }
            setCollectionDetail(collectionData[dropId])
            setModalLoading(false)
        }
    }

    const handleBridge = async () => {
        setIsBridging(true)
        if (isDrop) {
            await dropBridge(
                activeToken.contractAddress,
                toNetwork,
                amount,
                selectedDrop,
                activeToken
            )
        } else {
            await collectionBridge(
                collectionAddress,
                Number(selectedTokenId),
                amount,
                toNetwork,
                selectedNFTImage,
                activeToken,
                handleSelectValue,
                selectedCollection,
                activeCollection
            )
        }
        await getInitialData();
        setIsBridging(false)
    }

    const selectNFT = (i: number, tokenId: string, imageURL: string, token: any) => {
        const newClickStatus = clickStatus.map(((item: boolean, index: number) => {
            if (i === index) {
                return !item
            }
            return false
        }))
        setClickStatus(newClickStatus)
        if (newClickStatus.includes(true)) {
            setActiveToken(token)
            setSelectedTokenId(tokenId)
            setSelectedNFTImage(imageURL)
        } else {
            setActiveToken(null);
            setSelectedTokenId('');
            setSelectedNFTImage('')
        }
    }

    const selectDrop = (i: number) => {
        const newClickStatus = clickStatus.map((item: boolean, index: number) => {
            if (i === index) {
                return !item
            }
            return false
        })
        setClickStatus(newClickStatus)
        if (newClickStatus.includes(true)) {
            setActiveToken(dropData[i])
        } else {
            setActiveToken(null)
        }
    }

    const getInitialData = async () => {
        setIsLoading(true)
        if (isDrop) {
            const dropData = await getDropData() as any[] | undefined;
            if (!dropData) {
                enqueueSnackbar('Failed to fetch drop data', { variant: errorVariant })
                return;
            };
            setDropNames(dropData)
        } else {
            const collectionData = await getCollectionData() as any[] | undefined;
            if (!collectionData) {
                enqueueSnackbar('Failed to fetch collection data', { variant: errorVariant })
                return;
            }
            setCollectionNames(collectionData)
        }
        const totalNetworks = NetworkList.map(item => item.id)
        const toNetwork = NetworkList.filter(item => (item.id !== chain?.id && !availableNetworks.includes(item.id)))[0]?.id || 0
        setAvailableNetworks(totalNetworks)
        setNetworkNum(chain?.id || 0)
        setToNetwork(toNetwork)
        setIsLoading(false)
    }

    useEffect(() => {
        getInitialData()
    }, [isDrop, chain?.id])

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
            ) : isBridging ? (
                <Stack
                    justifyContent='center'
                    alignItems='center'
                    sx={{ minHeight: 'calc(100vh - 100px)' }}
                >
                    <span className="loading loading-infinity w-32 text-info"></span>
                    <div className='text-sky-500 font-bold text-2xl'>Bridging...</div>
                </Stack>
            ) : (
                <Stack className="max-w-7xl w-full relative">
                    <div className='text-2xl text-center'>Any avatar between supported blockchain networks with no loss of asset integrity</div>
                    <div className='w-full flex justify-end gap-4'>
                        <label className="swap swap-rotate">
                            <input type="checkbox" checked={isDrop} onChange={(event) => handleToggle(event.target.value)} />
                            <div className='text-rose-500 font-semibold swap-off'>Collection</div>
                            <div className='text-lime-500 font-semibold swap-on text-right'>Drop</div>
                        </label>
                        <input type="checkbox" className="toggle toggle-info" checked={isDrop} onChange={(event) => handleToggle(event.target.value)} />
                    </div>
                    <div className='w-full mt-4'>
                        <div className='text-sm font-semibold'>{isDrop ? 'Select Drop' : 'Select Collection'}</div>
                        <div className='w-full'>
                            <select className="select select-info w-full" onChange={(event) => handleSelectValue(event.target.value)}>
                                {isDrop ? (
                                    dropNames && (dropNames.length === 0 ? (
                                        <option disabled selected>There is no available drops</option>
                                    ) : (
                                        dropNames.map(({ value, label }: { value: string | number, label: string }) => (
                                            <option key={value} value={value} disabled={value === Number.NEGATIVE_INFINITY} selected={value === Number.NEGATIVE_INFINITY}>{label}</option>
                                        ))
                                    ))
                                ) : (
                                    collectionNames && (collectionNames.length === 0 ? (
                                        <option disabled selected>There is no available collections</option>
                                    ) : (
                                        collectionNames.map(({ value, label }: { value: string | number, label: string }) => (
                                            <option key={value} value={value} disabled={value === Number.NEGATIVE_INFINITY} selected={value === Number.NEGATIVE_INFINITY}>{label}</option>
                                        ))
                                    ))
                                )}
                            </select>
                        </div>
                    </div>
                    <div className='w-full mt-2'>
                        <div className='text-sm font-semibold'>Select Network</div>
                        <div className='w-full flex items-center gap-10'>
                            <select className="select select-info w-full" value={networkNum} onChange={(event) => handleSelectFromNetwork(event.target.value)}>
                                {NetworkList.filter(item => availableNetworks.includes(item.id)).map(item => {
                                    return (
                                        <option value={item.id} key={item.id}>{item.network}</option>
                                    )
                                })}
                            </select>
                            <select className="select select-info w-full" value={toNetwork} onChange={(event) => handleSelectToNetwork(event.target.value)}>
                                {NetworkList.filter(item => (item.id !== networkNum && availableNetworks.includes(item.id))).map(item => {
                                    return (
                                        <option value={item.id} key={item.id}>{item.network}</option>
                                    )
                                })}
                            </select>
                        </div>
                    </div>
                    <div className='w-full mt-2'>
                        <div className='text-sm font-semibold'>Select {isDrop ? 'Drops' : 'Collections'}</div>
                        <div className="mockup-window border border-sky-500/50 bg-sky-200/10">
                            <div className='absolute right-4 top-3'>{isDrop ? dropData.length : collectionData.length} available</div>
                            <div className='border-t border-sky-500/50 bg-sky-100 p-2 sm:p-4 md:p-6'>
                                <div>
                                    {modelLoading ? (
                                        <div className='w-full my-10 flex items-center justify-center'>
                                            <span className="loading loading-bars text-info" />
                                        </div>
                                    ) : (
                                        !isDrop ? (
                                            collectionData && collectionData.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                    {collectionData.map((token, i) => (
                                                        <div className="relative" key={token.imageURL}>
                                                            <Icon icon="icon-park-solid:view-grid-detail" className="text-2xl text-sky-500 font-bold cursor-pointer transition-all z-10 absolute top-2 left-2" onClick={() => handleOpen(i)} />
                                                            <input type="checkbox" className="cursor-pointer checkbox checkbox-info checkbox-sm absolute z-10 top-2 right-2" checked={clickStatus[i]} onChange={() => selectNFT(i, token.id, token.tokenURI, token)} />
                                                            <div key={token.imageURL} className={`${clickStatus[i] ? 'border-2 border-sky-500' : 'border-sky-500/50'} border rounded-xl relative`}>
                                                                <ModelViewer prevURL={token.imageURL} />
                                                                <div className="absolute text-sm font-semibold bottom-2 right-2">{token.supply}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex justify-center w-full">
                                                    <Player
                                                        autoplay
                                                        loop
                                                        src="https://lottie.host/4d0014a5-649e-4016-83b0-3b7bedf37631/vIBTlHnxhn.json"
                                                        style={{ height: '270px', width: '270px' }}
                                                    />
                                                </div>
                                            )
                                        ) : (
                                            dropData && dropData.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                    {dropData.map((item, i) => {
                                                        return (
                                                            <div className="relative" key={item.imageURL}>
                                                                <Icon icon="icon-park-solid:view-grid-detail" className="text-2xl text-sky-500 font-bold cursor-pointer transition-all z-10 absolute top-2 left-2" onClick={() => handleOpen(item.dropId, item.id)} />
                                                                <input type="checkbox" className="cursor-pointer checkbox checkbox-info checkbox-sm absolute z-10 top-2 right-2" checked={clickStatus[i]} onChange={() => selectDrop(i)} />
                                                                <div className={`${clickStatus[i] ? 'border-sky-500' : 'border-sky-500/50'} border rounded-xl relative`}>
                                                                    <ModelViewer prevURL={item.imageURL} />
                                                                    <div className="absolute text-sm font-semibold bottom-2 right-2">{item.amount}</div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex justify-center w-full">
                                                    <Player
                                                        autoplay
                                                        loop
                                                        src="https://lottie.host/4d0014a5-649e-4016-83b0-3b7bedf37631/vIBTlHnxhn.json"
                                                        style={{ height: '270px', width: '270px' }}
                                                    />
                                                </div>
                                            )
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='w-full mt-2'>
                        <div className='text-sm font-semibold'>Enter Amount</div>
                        <div className='w-full flex items-center gap-10'>
                            <input type="number" placeholder="Enter amount" value={amount} onChange={(event) => setAmount(event.target.value)} className="input input-bordered input-info w-full" />
                        </div>
                    </div>
                    <button
                        className='btn btn-info mt-4 justify-center text-white'
                        disabled={(!isDrop && selectedCollection === '') || (isDrop && selectedDrop === '') || networkNum === 0 || toNetwork === 0 || !clickStatus.includes(true) || amount === '' || (activeToken && (!isDrop ? Number(activeToken.supply) : Number(activeToken.amount)) < Number(amount))}
                        onClick={() => handleBridge()}
                    >
                        Bridge
                    </button>
                </Stack>
            )}
        </Stack>
    )
}
