import { Stack } from '@mui/material'
import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react'
import { useAccount } from 'wagmi';
import { Icon } from '@iconify/react';
import { useString } from '@/hooks/useString';

interface TabsProps {
    nftData: any
    collection: any
    sellListItemCount: number;
    setSellListItemCount: Dispatch<SetStateAction<number>>
    sellOfferItemCount: number;
    setSellOfferItemCount: Dispatch<SetStateAction<number>>
    openCreateListModal: () => void
    openMakeOfferModal: () => void
}

export default function Tabs({
    nftData,
    collection,
    sellListItemCount,
    setSellListItemCount,
    sellOfferItemCount,
    setSellOfferItemCount,
    openCreateListModal,
    openMakeOfferModal
}: TabsProps) {
    const { address } = useAccount();
    const { L } = useString();

    const [activeTab, setActiveTab] = useState(0);

    const handleChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value
        setSellListItemCount(Number(inputValue))
    }

    return (
        <Stack mt={2}>
            <div className="tabs">
                <a className={`tab tab-lifted ${activeTab === 0 && 'tab-active'}`} onClick={() => setActiveTab(0)}>Sell</a>
                <a className={`tab tab-lifted ${activeTab === 1 && 'tab-active'}`} onClick={() => setActiveTab(1)}>Buy</a>
            </div>
            {(activeTab === 0 && address) && (
                <Stack direction='row' gap={3} p={2}>
                    <button
                        className="btn btn-sm btn-info text-white"
                        onClick={() => openCreateListModal()}
                        disabled={L(collection.collecter) !== L(address) || collection.amount.reduce((acc: number, cur: number) => { return acc + cur }, 0) < sellListItemCount || sellListItemCount <= 0}
                    >
                        List
                        <div className="badge">{sellListItemCount}</div>
                        {sellListItemCount > 1 ? 'items' : 'item'}
                    </button>
                    <div className="form-control">
                        <div className="input-group" aria-disabled={L(collection.collecter) !== L(address)}>
                            <button
                                className='btn btn-info btn-sm text-white'
                                disabled={sellListItemCount <= 1}
                                onClick={() => setSellListItemCount(prev => prev - 1)}
                            >
                                <Icon icon="ic:round-minus" />
                            </button>
                            <input
                                type="text"
                                className="input input-sm input-bordered max-w-[100px]"
                                value={sellListItemCount}
                                onChange={(event) => handleChangeInput(event)}
                            />
                            <button
                                className="btn btn-sm btn-info text-white"
                                disabled={sellListItemCount >= collection.amount.reduce((acc: number, cur: number) => { return acc + cur }, 0)}
                                onClick={() => setSellListItemCount(prev => prev + 1)}
                            >
                                <Icon icon="ic:round-plus" />
                            </button>
                        </div>
                    </div>
                </Stack>
            )}
            {(activeTab === 1 && address) && (
                <Stack direction='row' gap={3} p={2}>
                    <button
                        className="btn btn-sm btn-info text-white"
                        onClick={() => openMakeOfferModal()}
                        disabled={L(collection.collecter) === L(address)}
                    >
                        Make offer
                    </button>
                    <div className="form-control">
                        <div className="input-group">
                            <button
                                className='btn btn-sm btn-info text-white'
                                disabled={sellOfferItemCount <= 1}
                                onClick={() => setSellOfferItemCount(prev => prev - 1)}
                            >
                                <Icon icon="ic:round-minus" />
                            </button>
                            <input
                                type="text"
                                className="input input-sm input-bordered max-w-[100px]"
                                value={sellOfferItemCount}
                                onChange={(event) => handleChangeInput(event)}
                            />
                            <button
                                className="btn btn-sm btn-info text-white"
                                disabled={sellOfferItemCount >= collection.amount.reduce((acc: number, cur: number) => { return acc + cur }, 0)}
                                onClick={() => setSellOfferItemCount(prev => prev + 1)}
                            >
                                <Icon icon="ic:round-plus" />
                            </button>
                        </div>
                    </div>
                </Stack>
            )}
        </Stack>
    )
}
