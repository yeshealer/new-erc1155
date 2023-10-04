import { NetworkList } from '@/constants/main';
import Link from 'next/link';
import * as React from 'react';
interface NFTDescriptionProps {
    nftData: any
    collection: any
}

export default function NFTDescription({
    nftData,
    collection
}: NFTDescriptionProps) {
    return (
        <div className="join join-vertical w-full">
            <div className="collapse collapse-arrow join-item border border-base-300">
                <input type="checkbox" name="my-accordion-4" />
                <div className="collapse-title text-base font-medium">
                    Description
                </div>
                <div className="collapse-content">
                    {nftData.nftDescription}
                </div>
            </div>
            <div className="collapse collapse-arrow join-item border border-base-300">
                <input type="checkbox" name="my-accordion-4" />
                <div className="collapse-title text-base font-medium">
                    Properties
                </div>
                <div className="collapse-content">
                    <div className='flex flex-wrap gap-1'>
                        {nftData.properties.map((item: any) => (
                            <div className="badge badge-info text-white" key={item.value}>{item.trait_type}</div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="collapse collapse-arrow join-item border border-base-300">
                <input type="checkbox" name="my-accordion-4" />
                <div className="collapse-title text-base font-medium">
                    Details
                </div>
                <div className="collapse-content">
                    <div className='flex items-center justify-between gap-2'>
                        <div className='badge badge-sm'>Contract address</div>
                        <Link href={`${NetworkList.find(item => item.id === nftData.network)?.explorer}${nftData.contractAddress}`} target='_block'>
                            <div className='cursor-pointer text-sky-500'>{nftData.contractAddress.slice(0, 6)}...{nftData.contractAddress.slice(-4)}</div>
                        </Link>
                    </div>
                    <div className='flex items-center justify-between gap-2'>
                        <div className='badge badge-sm'>Token ID</div>
                        <div>{nftData.tokenId}</div>
                    </div>
                    <div className='flex items-center justify-between gap-2'>
                        <div className='badge badge-sm'>Token Standard</div>
                        <div>ERC-1155</div>
                    </div>
                    <div className='flex items-center justify-between gap-2'>
                        <div className='badge badge-sm'>Chain</div>
                        <div>{NetworkList.find(item => item.id === nftData.network)?.network}</div>
                    </div>
                    <div className='flex items-center justify-between gap-2'>
                        <div className='badge badge-sm'>Creator Earnings</div>
                        <div>{collection.recipientPercentage / 100}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}