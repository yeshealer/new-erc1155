import { readContract, multicall, writeContract, waitForTransaction } from '@wagmi/core'
import useCollection from './useCollection'
import { DetailsType } from '@/constants/type';
import NFTABI from '@/constants/abi/SampModel.json'
import FetaMarketABI from '@/constants/abi/FetaMarket.json'
import { NetworkList } from '@/constants/main';
import { useAccount, useNetwork } from 'wagmi';
import { ethers } from 'ethers';
import { getCollectionDB } from '@/utils/polybaseHelper';
import { useRouter } from 'next/navigation';

const useNFTDetail = () => {
    const fetaMarketAddress = process.env.FETA_MARKET_CONTRACT
    const fetaMarketContract = {
        address: fetaMarketAddress as `0x${string}`,
        abi: FetaMarketABI
    }

    const {
        getCollectionData,
        getNFTData
    } = useCollection();
    const collectionDB = getCollectionDB();

    const { chain } = useNetwork();
    const { address } = useAccount();
    const router = useRouter();

    const fetchMainData = async (details: DetailsType) => {
        const nftData = await getNFTData();
        const collectionData = await getCollectionData();
        if (!nftData || !Array(nftData) || !collectionData || !Array(collectionData)) return;
        const matchNFTData = nftData.find(item => (item.contractAddress === details.contractAddress && String(item.network) === details.network && item.ownerAddress === details.ownerAddress))
        const matchCollection = collectionData.find((item: any) => item.id === matchNFTData?.collectionID)
        const availableUsers = nftData.filter(item => (item.contractAddress === details.contractAddress && String(item.network) === details.network))

        return { matchCollection, matchNFTData, availableUsers }
    }

    const fetchTokenPrice = async (nftData: any) => {
        const metaData = await readContract({
            address: nftData.contractAddress,
            abi: NFTABI,
            functionName: 'metaData'
        }) as any
        const tokenPrice = Number(metaData[4]) / 1e18
        return tokenPrice
    }

    const fetchSaleList = async (nftData: any) => {
        const saleCount = await readContract({
            ...fetaMarketContract,
            functionName: 'salesId'
        })
        const arr = Array.from({ length: Number(saleCount) }, (_, i) => i);
        const totalSalesContracts = arr.map(item => {
            return {
                ...fetaMarketContract,
                functionName: 'sales',
                args: [item]
            }
        })
        const totalSaleInfo = await multicall({
            contracts: totalSalesContracts as any
        })
        if (!nftData) return;
        const saleInfo = totalSaleInfo.map((item: any, index: number) => {
            if (item.result[1] === nftData.contractAddress) {
                return {
                    price: Number(item.result[4]) / 1e18 + ' ' + NetworkList.find(item => chain?.id === item.id)?.currency,
                    amount: Number(item.result[3]),
                    tokenId: Number(item.result[2]),
                    seller: item.result[0],
                    sellId: index,
                    isTotalSold: item.result[5]
                }
            }
        }).filter(item => item)
        return saleInfo.filter(item => !item?.isTotalSold)
    }

    const fetchOfferList = async (nftData: any) => {
        const listCount = await readContract({
            ...fetaMarketContract,
            functionName: 'offerId'
        })
        const arr = Array.from({ length: Number(listCount) }, (_, i) => i);
        const totalListContracts = arr.map(item => {
            return {
                ...fetaMarketContract,
                functionName: 'offerInfo',
                args: [item]
            }
        })
        const totalListInfo = await multicall({
            contracts: totalListContracts as any
        })
        if (!nftData) return;
        const listInfo = totalListInfo.map((item: any, index: number) => {
            if (item.result[1] === nftData.contractAddress) {
                return {
                    price: Number(item.result[4]) / 1e18 + ' ' + NetworkList.find(item => chain?.id === item.id)?.currency,
                    amount: Number(item.result[3]),
                    tokenId: Number(item.result[2]),
                    offerAddress: item.result[0],
                    offerId: index,
                    isAccepted: item.result[6]
                }
            }
        }).filter(item => item)
        return listInfo.filter(item => !item?.isAccepted)
    }

    const handleCancelList = async (sellId: string, nftData: any) => {
        try {
            await writeContract({
                ...fetaMarketContract,
                functionName: 'cancelList',
                args: [sellId]
            }).then(res => {
                const handleNextAction = async () => {
                    if (!res.hash) return;
                    const result = await waitForTransaction({
                        hash: res.hash
                    })
                    if (result.status === 'success') {
                        await fetchSaleList(nftData)
                    }
                }
                handleNextAction()
            })
        } catch (err) {
            console.log(err);
        }
    }

    const handleBuyListToken = async (
        sellId: string,
        amount: number,
        price: string,
        seller: string,
        nftData: any,
        availableUsers: any,
        getMainData: () => void
    ) => {
        const NFTData = await collectionDB.collection('NFTData')
        try {
            await writeContract({
                ...fetaMarketContract,
                functionName: 'buyListToken',
                args: [
                    sellId,
                    amount
                ],
                value: ethers.parseEther((amount * Number(price.slice(0, price.length - 5))).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 })),
            }).then(res => {
                const handleNextAction = async () => {
                    if (!res.hash) return;
                    const result = await waitForTransaction({ hash: res.hash })
                    if (result.status === 'success') {
                        if (availableUsers && nftData) {
                            const currentId = nftData.imageURI + nftData.network + nftData.tokenId + seller
                            const newId = nftData.imageURI + nftData.network + nftData.tokenId + address
                            const isExist = availableUsers.map((item: any) => item.id).includes(newId)
                            const currentAmount = Number(availableUsers.find((item: any) => item.id === currentId).supply)
                            if ((currentAmount - Number(amount)) === 0) {
                                await NFTData.record(currentId).call('del');
                            } else {
                                await NFTData.record(currentId).call('updateSupply', [currentAmount - Number(amount)])
                            }
                            if (isExist) {
                                const newCurrentAmount = Number(availableUsers.find((item: any) => item.id === newId).supply)
                                await NFTData.record(newId).call('updateSupply', [newCurrentAmount + Number(amount)])
                            } else {
                                const today = new Date();
                                const dateString = today.toLocaleDateString('en-US');
                                await NFTData.create([
                                    newId,
                                    nftData.imageURI,
                                    nftData.collectionId,
                                    Number(amount),
                                    nftData.name,
                                    nftData.description,
                                    nftData.network,
                                    nftData.tokenId,
                                    nftData.contractAddress,
                                    address,
                                    nftData.symbol,
                                    dateString
                                ])
                            }
                            if ((currentAmount - Number(amount)) === 0) {
                                router.push(`/${address}`)
                            } else {
                                getMainData();
                            }
                        }
                    }
                }
                handleNextAction()
            })
        } catch (err) {
            console.log(err)
        }
    }

    const handleCancelOffer = async (offerId: string, nftData: any) => {
        try {
            await writeContract({
                ...fetaMarketContract,
                functionName: 'cancelOffer',
                args: [offerId]
            }).then(res => {
                const handleNextAction = async () => {
                    if (!res.hash) return;
                    const result = await waitForTransaction({ hash: res.hash })
                    if (result.status === 'success') {
                        await fetchOfferList(nftData)
                    }
                }
                handleNextAction()
            })
        } catch (err) {
            console.log(err);
        }
    }

    const handleAcceptOffer = async (
        offerId: string,
        amount: string,
        offerAddress: string,
        nftData: any,
        availableUsers: any,
        getMainData: () => void
    ) => {
        const NFTData = await collectionDB.collection('NFTData')
        try {
            const handleMainAcceptOffer = async () => {
                await writeContract({
                    ...fetaMarketContract,
                    functionName: 'acceptOffer',
                    args: [
                        offerId,
                    ]
                }).then(res => {
                    const handleNextAction = async () => {
                        if (!res.hash) return;
                        const result = await waitForTransaction({ hash: res.hash })
                        if (result.status === 'success') {
                            if (availableUsers && nftData) {
                                const currentId = nftData.imageURI + nftData.network + nftData.tokenId + address
                                const newId = nftData.imageURI + nftData.network + nftData.tokenId + offerAddress
                                const isExist = availableUsers.map((item: any) => item.id).includes(newId)
                                const currentAmount = Number(availableUsers.find((item: any) => item.id === currentId).supply)
                                if ((currentAmount - Number(amount)) === 0) {
                                    await NFTData.record(currentId).call('del');
                                } else {
                                    await NFTData.record(currentId).call('updateSupply', [currentAmount - Number(amount)])
                                }
                                if (isExist) {
                                    const newCurrentAmount = Number(availableUsers.find((item: any) => item.id === newId).supply)
                                    await NFTData.record(newId).call('updateSupply', [newCurrentAmount + Number(amount)])
                                } else {
                                    const today = new Date();
                                    const dateString = today.toLocaleDateString('en-US');
                                    await NFTData.create([
                                        newId,
                                        nftData.imageURI,
                                        nftData.collectionId,
                                        Number(amount),
                                        nftData.name,
                                        nftData.description,
                                        nftData.network,
                                        nftData.tokenId,
                                        nftData.contractAddress,
                                        offerAddress,
                                        nftData.symbol,
                                        dateString
                                    ])
                                }
                                if ((currentAmount - Number(amount)) === 0) {
                                    router.push(`/${address}`)
                                } else {
                                    getMainData();
                                }
                            }
                        }
                    }
                    handleNextAction()
                })
            }
            const isApproved = await readContract({
                address: nftData.contractAddress,
                abi: NFTABI,
                functionName: 'isApprovedForAll',
                args: [
                    address,
                    fetaMarketAddress
                ]
            })
            if (!isApproved) {
                await writeContract({
                    address: nftData.contractAddress,
                    abi: NFTABI,
                    functionName: 'setApprovalForAll',
                    args: [
                        fetaMarketAddress,
                        true
                    ]
                }).then(res => {
                    const handleNextAction = async () => {
                        if (!res.hash) return;
                        const result = await waitForTransaction({ hash: res.hash })
                        if (result.status === 'success') {
                            handleMainAcceptOffer();
                        }
                    }
                    handleNextAction()
                })
            } else {
                handleMainAcceptOffer();
            }
        } catch (err) {
            console.log(err);
        }
    }

    const handleCreateList = async (
        nftData: any,
        sellListItemCount: number,
        tokenPrice: number
    ) => {
        if (sellListItemCount > 0 && nftData) {
            try {
                if (tokenPrice) {
                    const isApproved = await readContract({
                        address: nftData.contractAddress,
                        abi: NFTABI,
                        functionName: 'isApprovedForAll',
                        args: [
                            address,
                            fetaMarketAddress
                        ]
                    })
                    const createListFunc = async () => {
                        await writeContract({
                            ...fetaMarketContract,
                            functionName: 'createList',
                            args: [
                                nftData.contractAddress,
                                nftData.tokenId,
                                sellListItemCount,
                                ethers.parseEther(tokenPrice.toString())
                            ]
                        }).then(res => {
                            const handleNextAction = async () => {
                                if (!res.hash) return;
                                const result = await waitForTransaction({ hash: res.hash })
                                if (result.status === 'success') {
                                    await fetchSaleList(nftData)
                                }
                            }
                            handleNextAction()
                        })
                    }
                    if (!isApproved) {
                        await writeContract({
                            address: nftData.contractAddress,
                            abi: NFTABI,
                            functionName: 'setApprovalForAll',
                            args: [
                                fetaMarketAddress,
                                true
                            ]
                        }).then(res => {
                            const handleNextAction = async () => {
                                if (!res.hash) return;
                                const result = await waitForTransaction({ hash: res.hash })
                                if (result.status === 'success') {
                                    await createListFunc()
                                }
                            }
                            handleNextAction()
                        })
                    } else {
                        await createListFunc();
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }
    }

    const handleMakeOffer = async (
        nftData: any,
        sellOfferItemCount: number,
        tokenPrice: number
    ) => {
        if (sellOfferItemCount > 0 && nftData) {
            try {
                if (tokenPrice) {
                    await writeContract({
                        ...fetaMarketContract,
                        functionName: 'makeOffer',
                        args: [
                            nftData.contractAddress,
                            nftData.tokenId,
                            sellOfferItemCount,
                            ethers.parseEther(tokenPrice.toString()),
                            nftData.ownerAddress,
                        ],
                        value: ethers.parseEther((sellOfferItemCount * tokenPrice).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 10 })),
                    }).then(res => {
                        const handleNextAction = async () => {
                            if (!res.hash) return;
                            const result = await waitForTransaction({ hash: res.hash })
                            if (result.status === 'success') {
                                await fetchOfferList(nftData)
                            }
                        }
                        handleNextAction();
                    })
                }
            } catch (err) {
                console.log(err)
            }
        }
    }

    return {
        fetchMainData,
        fetchTokenPrice,
        fetchSaleList,
        fetchOfferList,
        handleCancelList,
        handleBuyListToken,
        handleCancelOffer,
        handleAcceptOffer,
        handleCreateList,
        handleMakeOffer
    }
}

export default useNFTDetail