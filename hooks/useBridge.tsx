import { NetworkList } from '@/constants/main';
import { getCollectionDB, getDropDB } from '@/utils/polybaseHelper'
import { useAccount, useNetwork } from 'wagmi';
import { readContract, writeContract, waitForTransaction } from '@wagmi/core'
import useIPFS from './useIPFS';
import SampModelABI from '@/constants/abi/SampModel.json'
import { ZERO_ADDRESS } from '@/utils/addressHelper';
import { ethers } from 'ethers';
import { enqueueSnackbar } from 'notistack';
import { errorVariant, successVariant } from '@/utils/stickyHelper';
import { useEffect } from 'react';

export default function useBridge() {
    const dropDB = getDropDB();
    const collectionDB = getCollectionDB();
    const { get3DImageLink } = useIPFS();

    const { address } = useAccount();
    const { chain } = useNetwork();

    const collectionReference = collectionDB.collection("CollectionData");
    const nftReference = collectionDB.collection("NFTData")
    const dropReference = dropDB.collection('DropCollection')
    const collecterReference = dropDB.collection('CollecterCollection')

    const getCollectionData = async () => {
        try {
            if (!address) return;
            const collectionData = await collectionReference.get();
            const nftData = await nftReference.get();
            const availableNFTData = nftData.data
                .filter(item => item.data.ownerAddress.toLowerCase() === address.toLowerCase() && item.data.network === chain?.id)
                .map(item => item.data.collectionId);

            const availableCollections = collectionData.data
                .filter(item => availableNFTData.includes(item.data.id) && item.data.deployedNetwork.includes(chain?.id))
                .map(item => ({
                    value: item.data.id,
                    label: item.data.collectionName
                }));
            availableCollections.unshift({ value: Number.NEGATIVE_INFINITY, label: 'Please select available collection' })
            return availableCollections
        } catch (err) {
            console.log(err)
        }
    }

    const getDropData = async () => {
        try {
            if (!address) return;
            const dropData = await dropReference.get();
            const collecterData = await collecterReference.get();
            const collecterInfo = collecterData.data
                .filter(item => item.data.collecter.toLowerCase() === address.toLowerCase() && item.data.amount.length > 0 && item.data.network === chain?.id)
                .map(item => item.data.dropId);

            const dropsInfo = dropData.data
                .filter(item => collecterInfo.includes(item.data.id) && item.data.network.includes(NetworkList.find(item => item.id === chain?.id)?.network))
                .map(item => ({
                    value: item.data.id,
                    label: item.data.title
                }))
            dropsInfo.unshift({ value: Number.NEGATIVE_INFINITY, label: 'Please select available drop' });
            return dropsInfo
        } catch (err) {
            console.log(err)
        }
    }

    const getSpecificDropData = async (dropId: number, claimId: number) => {
        const dropData = await dropReference.get();
        const dropInfo = dropData.data.find(item => item.data.id === dropId)?.data
        const imageURL = await get3DImageLink(dropInfo.baseURI)
        const dropDetail = {
            claimId: claimId,
            imageURL: imageURL,
            ...dropInfo
        }
        return dropDetail
    }

    const selectDropActivity = async (value: string) => {
        try {
            const dropData = await dropReference.get();
            const collecterData = await collecterReference.get();
            const selectedDrop = dropData.data.find(item => item.data.id === value)?.data
            const networkList = selectedDrop.network.map((network: string) => {
                return NetworkList.find(item => item.network === network)?.id
            })
            const imageURL = await get3DImageLink(selectedDrop.baseURI)

            const availableDrops = collecterData.data.find(item => item.data.dropId === value && item.data.network === chain?.id && item.data.collecter === address)?.data
            const amountList = availableDrops.amount
            const idList = availableDrops.claimId
            const dropListByID = idList.map((item: string, index: number) => {
                return {
                    id: item,
                    amount: amountList.reduce((acc: number, cur: number) => acc + cur, 0),
                    dropId: availableDrops.dropId,
                    collecterId: availableDrops.id,
                    collecterAddress: availableDrops.collecter,
                    network: availableDrops.network,
                    imageURL: imageURL,
                    contractAddress: selectedDrop.contractAddress
                }
            })
            return { dropListByID, networkList }
        } catch (err) {
            console.log(err)
        }
    }

    const selectCollectionActivity = async (value: string) => {
        try {
            if (!address) return;
            const collectionData = await collectionReference.get();
            const nftData = await nftReference.get();
            const selectedCollection = collectionData.data.find(item => item.data.id === value)
            const availableNFTData = nftData.data.filter(item => item.data.collectionId === value)
            let displayNFTData: any = availableNFTData
                .filter(nft => nft.data.network === chain?.id && nft.data.ownerAddress.toLowerCase() === address.toLowerCase())
                .map(async nft => {
                    const imageURL = await get3DImageLink(nft.data.imageURI);
                    const networkImage = NetworkList.find(network => network.id === nft.data.network)?.image;

                    return {
                        imageURL,
                        networkImage,
                        nftName: nft.data.name,
                        nftDescription: nft.data.description,
                        supply: nft.data.supply,
                        id: nft.data.tokenId,
                        tokenURI: nft.data.imageURI,
                        symbol: nft.data.symbol,
                        contractAddress: nft.data.contractAddress,
                        ownerAddress: nft.data.ownerAddress,
                    };
                });

            displayNFTData = await Promise.all(displayNFTData);
            return { selectedCollection, displayNFTData }
        } catch (err) {
            console.log(err)
        }
    }

    const collectionBridge = async (
        collectionAddress: `0x${string}`,
        selectedTokenId: number,
        amount: string,
        toNetwork: number,
        selectedNFTImage: string,
        activeToken: any,
        handleSelectValue: (value: string) => void,
        selectedCollection: string,
        activeCollection: any
    ) => {
        if (!collectionAddress || !selectedTokenId || !amount || !toNetwork || !selectedNFTImage || !activeToken || !selectedCollection || !activeCollection) return;
        try {
            console.log(collectionAddress, selectedTokenId, amount, toNetwork, selectedNFTImage, activeToken, selectedCollection, activeCollection)
            const collectionContract = {
                address: collectionAddress,
                abi: SampModelABI
            }
            const dstChainId = NetworkList.find(item => item.id === Number(toNetwork))?.dstChainId
            const adapterParams = await readContract({
                ...collectionContract,
                functionName: 'getAdapterParams'
            })
            const estimateSendFee = await readContract({
                ...collectionContract,
                functionName: 'estimateSendFee',
                args: [dstChainId, address, selectedTokenId, amount, false, adapterParams]
            }) as BigInt[]

            await writeContract({
                ...collectionContract,
                functionName: 'sendFrom',
                args: [
                    address,
                    dstChainId,
                    address,
                    selectedTokenId,
                    amount,
                    address,
                    ZERO_ADDRESS,
                    adapterParams
                ],
                value: ethers.parseEther(((Number(estimateSendFee[0]) + 100) / 1e18).toString())
            }).then(async (res) => {
                if (!res.hash) return;
                const result = await waitForTransaction({ hash: res.hash })
                if (result.status === 'success') {
                    const newBalance = await readContract({
                        ...collectionContract,
                        functionName: 'balanceOf',
                        args: [address, selectedTokenId]
                    })
                    const updateNFTData = await nftReference.get();
                    if (Number(newBalance) > 0) {
                        await nftReference.record(selectedNFTImage + chain?.id + activeToken.id + address).call('updateSupply', [Number(newBalance)])
                    } else {
                        await nftReference.record(selectedNFTImage + chain?.id + activeToken.id + address).call('del')
                    }
                    await handleSelectValue(selectedCollection)
                    const isHere = updateNFTData.data.map((item) => item.data.id).includes(selectedNFTImage + toNetwork + activeToken.id + address)
                    if (isHere) {
                        const currentCount = updateNFTData.data.find((item) => item.data.id === (selectedNFTImage + toNetwork + activeToken.id + address).toString())?.data.supply + Number(amount)
                        await nftReference.record(selectedNFTImage + toNetwork + activeToken.id + address).call('updateSupply', [currentCount])
                    } else {
                        const today = new Date();
                        const dateString = today.toLocaleDateString('en-US');
                        await nftReference.create([
                            selectedNFTImage + toNetwork + activeToken.id + address,
                            selectedNFTImage,
                            activeCollection.data.id,
                            Number(amount),
                            activeToken.nftName,
                            activeToken.nftDescription,
                            Number(toNetwork),
                            Number(activeToken.id),
                            collectionAddress,
                            address,
                            activeToken.symbol,
                            dateString
                        ])
                    }
                    enqueueSnackbar('Successfully bridged', { variant: successVariant })
                }
            })
        } catch (err) {
            console.log(err)
            enqueueSnackbar('Collection bridge has been failed', { variant: errorVariant })
        }
    }

    useEffect(() => {
        (async () => {
            const nftData = await nftReference.get()
            console.log(nftData)
        })()
    }, [])

    return {
        getCollectionData,
        getDropData,
        selectDropActivity,
        selectCollectionActivity,
        getSpecificDropData,
        collectionBridge
    }
}
