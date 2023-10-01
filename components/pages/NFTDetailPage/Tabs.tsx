import { Stack } from '@mui/material'
import React, { ChangeEvent, Dispatch, SetStateAction, useState } from 'react'
import { useAccount } from 'wagmi';
import { Icon } from '@iconify/react';

interface TabsProps {
    nftData: any
    sellListItemCount: number;
    setSellListItemCount: Dispatch<SetStateAction<number>>
    sellOfferItemCount: number;
    setSellOfferItemCount: Dispatch<SetStateAction<number>>
    setIsCreateListModal: Dispatch<SetStateAction<boolean>>
    setIsMakeOfferModal: Dispatch<SetStateAction<boolean>>
    openCreateListModal: () => void
}

export default function Tabs({
    nftData,
    sellListItemCount,
    setSellListItemCount,
    sellOfferItemCount,
    setSellOfferItemCount,
    setIsCreateListModal,
    setIsMakeOfferModal,
    openCreateListModal
}: TabsProps) {
    const { address } = useAccount();

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
                        disabled={nftData.ownerAddress.toLocaleLowerCase() !== address.toLocaleLowerCase() || nftData.supply < sellListItemCount || sellListItemCount <= 0}
                    >
                        List
                        <div className="badge">{sellListItemCount}</div>
                        {sellListItemCount > 1 ? 'items' : 'item'}
                    </button>
                    <div className="form-control">
                        <div className="input-group">
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
                                disabled={sellListItemCount >= nftData.supply}
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
                        onClick={() => setIsMakeOfferModal(true)}
                        disabled={nftData.ownerAddress.toLocaleLowerCase() === address.toLocaleLowerCase()}
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
                                disabled={sellOfferItemCount >= nftData.supply}
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
