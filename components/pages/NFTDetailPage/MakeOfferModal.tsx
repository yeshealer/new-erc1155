import React, { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { Stack } from '@mui/material'
import { NetworkList } from '@/constants/main'
import { useAccount, useNetwork } from 'wagmi'
import { Icon } from '@iconify/react'
import useNFTDetail from '@/hooks/useNFTDetail'

interface MakeOfferModalProps {
    nftData: any
    tokenPrice: number
    setTokenPrice: Dispatch<SetStateAction<number>>
    sellOfferItemCount: number;
    setSellOfferItemCount: Dispatch<SetStateAction<number>>
}

export default function MakeOfferModal({
    nftData,
    tokenPrice,
    sellOfferItemCount,
    setSellOfferItemCount,
    setTokenPrice
}: MakeOfferModalProps) {
    const { chain } = useNetwork();
    const { address } = useAccount();

    const { handleMakeOffer } = useNFTDetail();

    const handleChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value
        setSellOfferItemCount(Number(inputValue))
    }

    return (
        <dialog id="make_offer_modal" className="modal">
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
                        <Stack justifyContent='space-between' alignItems='center' direction='row' mt={1}>
                            <div className='text-sm'>Token Price</div>
                            <input
                                type="text"
                                placeholder="Type here"
                                className="input input-sm input-bordered w-full max-w-xs"
                                value={tokenPrice}
                                onChange={(event) => setTokenPrice(Number(event.target.value))}
                                disabled={nftData.ownerAddress.toLocaleLowerCase() === address.toLocaleLowerCase()}
                            />
                        </Stack>
                        <Stack justifyContent='flex-end' mt={2}>
                            <button
                                className='btn btn-info btn-sm text-white'
                                disabled={nftData.ownerAddress.toLocaleLowerCase() === address.toLocaleLowerCase()}
                                onClick={() => handleMakeOffer(nftData, sellOfferItemCount, tokenPrice)}
                            >
                                Make Offer
                            </button>
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
