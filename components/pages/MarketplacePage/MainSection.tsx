import React, { useEffect, useState } from 'react'
import { Stack } from '@mui/material'
import { IconButton } from '@/components/globalstyle';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { NetworkList } from '@/constants/main';
import { switchNetwork } from '@wagmi/core'
import { useSnackbar } from 'notistack';
import { errorVariant } from '@/utils/stickyHelper';
import useDrop from '@/hooks/useDrop';
import { ZERO_ADDRESS } from '@/utils/addressHelper';
import { useAccount, useNetwork } from 'wagmi';
import ModelViewer from '@/components/widgets/ModelViewer';

const filterData = ['All', 'Listings', 'Offers'].map(
    item => ({ label: item, value: item })
);

export default function MainSection() {
    const router = useRouter();
    const { address } = useAccount();
    const { chain } = useNetwork();
    const { enqueueSnackbar } = useSnackbar();
    const {
        getSalesData,
        getOfferData,
        getDropData
    } = useDrop();

    const [isLoading, setIsLoading] = useState(false);
    const [typeFilter, setTypeFilter] = useState(filterData[0].value);
    const [searchFilter, setSearchFilter] = useState({
        network: 0
    });
    const [saleData, setSaleData] = useState<any[]>([]);
    const [offerData, setOfferData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState(0);

    const handleChangeType = (value: string) => {
        setTypeFilter(value)
    }

    const handleChangeSearchFilter = async (value: string, type: string) => {
        if (type === 'network') {
            setSearchFilter({ ...searchFilter, network: Number(value) })
            try {
                await switchNetwork({
                    chainId: Number(value)
                })
            } catch (err) {
                console.log(err)
                enqueueSnackbar('Failed to switch network', { variant: errorVariant })
            }
        }
    }

    const getInitialData = async () => {
        setIsLoading(true)
        const [saleData, offerData, dropData] = await Promise.all([getSalesData(), getOfferData(), getDropData()]);

        const availableSaleInfo = saleData
            .filter((item: any) => item.token !== ZERO_ADDRESS)
            .map((saleItem: any) => {
                const baseInfo = dropData?.find(dropItem => dropItem.contractAddress === saleItem.token);
                if (!baseInfo) return null;

                return {
                    amount: Number(saleItem.amount),
                    price: Number(saleItem.price) / 1e18,
                    seller: saleItem.seller,
                    imageURL: baseInfo.imageURL,
                    title: baseInfo.title,
                    symbol: baseInfo.symbol,
                    initialPrice: baseInfo.pricePerToken,
                    token: saleItem.token,
                    tokenID: Number(saleItem.tokenId)
                };
            })
            .filter((item: any) => item !== null);

        const availableOfferInfo = offerData
            .filter((item: any) => item.token !== ZERO_ADDRESS)
            .map((offerItem: any) => {
                const baseInfo = dropData?.find(dropItem => dropItem.contractAddress === offerItem.token);
                if (!baseInfo) return null;

                return {
                    amount: Number(offerItem.amount),
                    price: Number(offerItem.price) / 1e18,
                    seller: offerItem.seller,
                    imageURL: baseInfo.imageURL,
                    title: baseInfo.title,
                    symbol: baseInfo.symbol,
                    initialPrice: baseInfo.pricePerToken,
                    token: offerItem.token,
                    tokenID: Number(offerItem.tokenId),
                    owner: offerItem.ownerAddress
                };
            })
            .filter((item: any) => item !== null);

        setSaleData(availableSaleInfo);
        setOfferData(availableOfferInfo);
        setIsLoading(false)
    }


    useEffect(() => {
        getInitialData();
    }, [])

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
                    <Stack direction='row' justifyContent='flex-end' alignItems='center'>
                        <IconButton
                            onClick={() => router.push('/drop')}
                            className="absolute left-0"
                        >
                            <Icon icon="solar:undo-left-bold" fontSize={20} />
                        </IconButton>
                        <div className='flex flex-col sm:flex-row items-center gap-2'>
                            <select className="select select-info select-sm w-full max-w-[160px]" onChange={(event) => handleChangeType(event.target.value)}>
                                {filterData.map(item => {
                                    return (
                                        <option key={item.value} value={item.value}>{item.label}</option>
                                    )
                                })}
                            </select>
                            <select className="select select-info select-sm w-full max-w-[160px]" onChange={(event) => handleChangeSearchFilter(event.target.value, 'network')}>
                                {NetworkList.map(item => {
                                    return (
                                        <option key={item.network} value={item.id}>
                                            <div className='flex items-center gap-2'>
                                                <img src={item.image} alt='chain logo' width={22} height={22} />
                                                {item.network}
                                            </div>
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                    </Stack>
                    <div className='divider' />
                    <Stack>
                        <div className="tabs">
                            <a className={`tab tab-lifted ${activeTab === 0 && 'tab-active'}`} onClick={() => setActiveTab(0)}>Sale List</a>
                            <a className={`tab tab-lifted ${activeTab === 1 && 'tab-active'}`} onClick={() => setActiveTab(1)}>Offer List</a>
                        </div>
                        {activeTab === 0 && (
                            <Stack direction='row' flexWrap='wrap' justifyContent='space-between' gap='10px' mt='20px'>
                                {(saleData && saleData.length > 0) ? saleData.map((item: any, index: number) => (
                                    <div className='card card-compact w-[410px] bg-base-100 shadow-xl border border-sky-500/50' key={index}>
                                        <figure className='relative'>
                                            <ModelViewer prevURL={item.imageURL} />
                                            <div className='badge badge-sm badge-info text-white absolute top-2 left-2 z-10'>{item.title} ({item.symbol})</div>
                                            {item.seller === address && <div className='badge badge-sm badge-error text-white absolute top-2 right-2 z-10'>Owned</div>}
                                        </figure>
                                        <div className='card-body'>
                                            <div>
                                                <span className='text-sky-500 cursor-pointer' onClick={() => router.push(`/${item.seller}`)}>
                                                    {item.seller === address ? 'You' : item.seller.slice(0, 6).toLocaleUpperCase() + '...'}
                                                </span> listed
                                                <span className='text-sky-500 ml-1'>
                                                    {item.amount}
                                                </span> Drop(s) for sale
                                            </div>
                                            <div>
                                                {item.seller === address ? 'Your' : 'This'} Drop claimed at
                                                <span className='text-sky-500 ml-1'>
                                                    {item.initialPrice === 0 ? 'Free' : item.initialPrice}
                                                </span> and listed at
                                                <span className='text-sky-500 ml-1'>
                                                    {item.price === 0 ? 'Free' : item.price} {NetworkList.find(item => item.id === chain?.id)?.currency}
                                                </span>
                                            </div>
                                            <button className="btn btn-block btn-info btn-sm text-white mt-3" onClick={() => router.push(`/dropDetail/${item.token}/${chain?.id}/${item.tokenID}/${item.seller}`)}>
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
                            </Stack>
                        )}
                        {activeTab === 1 && (
                            <Stack direction='row' flexWrap='wrap' justifyContent='space-between' gap='10px' mt='10px'>
                                {(offerData && offerData.length > 0) ? offerData.map((item: any, index: number) => (
                                    <div className='card card-compact w-[410px] bg-base-100 shadow-xl border border-sky-500/50' key={index}>
                                        <figure className='relative'>
                                            <ModelViewer prevURL={item.imageURL} />
                                            <div className='badge badge-sm badge-info text-white absolute top-10 left-10 z-10'>{item.title} ({item.symbol})</div>
                                            <Stack alignItems='center' gap={1} direction={'row'} position={'absolute'} top={'10px'} right={'10px'} zIndex={10}>
                                                {item.seller === address && <div className='badge badge-sm badge-error text-white'>Owned Offer</div>}
                                                {item.owner === address && <div className='bdage badge-sm badge-primary text-white'>Owned Drop</div>}
                                            </Stack>
                                        </figure>
                                        <div className='card-body'>
                                            <div>
                                                <span className='text-sky-500 cursor-pointer' onClick={() => router.push(`/${item.seller}`)}>
                                                    {item.seller === address ? 'You' : item.seller.slice(0, 6).toLocaleUpperCase() + '...'}
                                                </span> made an offer
                                                <span className='text-sky-500 ml-1'>
                                                    {item.amount}
                                                </span> Drop(s) to buy
                                            </div>
                                            <div>
                                                {item.owner === address ? 'Your' : 'This'} Drop claimed at
                                                <span className='text-sky-500 ml-1'>
                                                    {item.initialPrice === 0 ? 'Free' : item.initialPrice}
                                                </span> and offered at
                                                <span className='text-sky-500 ml-1'>
                                                    {item.price === 0 ? 'Free' : item.price} {NetworkList.find(item => item.id === chain?.id)?.currency}
                                                </span>
                                            </div>
                                            <button className="btn btn-block btn-info btn-sm text-white mt-3" onClick={() => router.push(`/dropDetail/${item.token}/${chain?.id}/${item.tokenID}/${item.seller}`)}>
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
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            )}
        </Stack>
    )
}
