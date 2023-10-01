import React, { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { Stack } from '@mui/material'
import { NetworkList } from '@/constants/main'
import { useAccount, useNetwork } from 'wagmi'
import { Icon } from '@iconify/react'

interface CreateListModalProps {
    nftData: any
    tokenPrice: number
    setTokenPrice: Dispatch<SetStateAction<number>>
    sellListItemCount: number;
    setSellListItemCount: Dispatch<SetStateAction<number>>
    sellOfferItemCount: number;
    setSellOfferItemCount: Dispatch<SetStateAction<number>>
}

export default function CreateListModal({
    nftData,
    tokenPrice,
    sellListItemCount,
    setSellListItemCount,
    sellOfferItemCount,
    setSellOfferItemCount,
    setTokenPrice
}: CreateListModalProps) {

    const { chain } = useNetwork();
    const { address } = useAccount();

    const handleChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value
        setSellListItemCount(Number(inputValue))
    }

    return (
        <dialog id="create_list_modal" className="modal">
            <div className="modal-box">
                {(chain?.id && address) && (
                    <Stack>
                        {NetworkList.map(item => item.id).includes(chain?.id) && (
                            <Stack fontSize={15} direction='row' alignItems='center' gap={1}>
                                This NFT will mint at
                                <Stack component='span' fontWeight='bold' fontSize={16}>{tokenPrice} {NetworkList.find(item => chain?.id === item.id)?.currency}</Stack>
                            </Stack>
                        )}
                        <Stack justifyContent='space-between' direction='row' mt={4}>
                            <div className='text-sm'>Token Amount</div>
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
                        <Stack justifyContent='space-between' alignItems='center' direction='row' mt={1}>
                            <div className='text-sm'>Token Price</div>
                            <input type="text" placeholder="Type here" className="input input-sm input-bordered w-full max-w-xs" value={tokenPrice} onChange={(event) => setTokenPrice(Number(event.target.value))} disabled={nftData.ownerAddress.toLocaleLowerCase() !== address.toLocaleLowerCase()} />
                        </Stack>
                    </Stack>
                )}
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    )
}
