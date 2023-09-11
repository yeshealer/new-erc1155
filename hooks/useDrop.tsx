import { readContract, writeContract, waitForTransaction } from '@wagmi/core'
import DropFactoryABI from '@/constants/abi/DropFactory.json'
import { DropDetailTypes } from '@/constants/type'
import { ethers } from 'ethers'
import { useAccount, useNetwork as useNetworkInfo } from 'wagmi'
import { createDropSchema, getDropDB } from '@/utils/polybaseHelper'
import { NetworkList } from '@/constants/main'
import { Dispatch, SetStateAction } from 'react'
import useIPFS from './useIPFS'
import DropABI from '@/constants/abi/Drop.json'
import useNetwork from './useNetwork'

export default function useDrop() {
    const dropFactoryAddress = process.env.DROP_FACTORY_CONTRACT as `0x${string}`
    const implementationAddress = process.env.DROP_IMPLEMENTATION_CONTRACT as `0x${string}`

    const { address } = useAccount();
    const { chain } = useNetworkInfo();
    const { getNetworkIndex } = useNetwork();

    const dropDB = getDropDB();
    const { get3DImageLink } = useIPFS();

    const dropDatabase = dropDB.collection('DropCollection')
    const collecterDatabase = dropDB.collection('CollecterCollection');

    const getDropData = async (setIsLoading: Dispatch<SetStateAction<boolean>>) => {
        try {
            if (!dropDB) return;
            const collectionReference = dropDB.collection("DropCollection");
            if (!collectionReference) return;
            const data = await collectionReference.get();
            console.log(data)
            const dropData = data.data.map(item => item.data)
            const dropDataLatest: any[] = []
            for (let i = 0; i < dropData.length; i++) {
                const imgLink = await get3DImageLink(dropData[i].baseURI)
                dropDataLatest.push({ ...dropData[i], imageURL: imgLink })
            }
            return dropDataLatest
        } catch (err) {
            console.log(err)
            setIsLoading(false)
        }
    }

    const createDrop = async (dropDetail: DropDetailTypes, tokenURI: string, price: number, duration: number, setIsMinting: Dispatch<SetStateAction<boolean>>) => {
        if (!dropDetail || !tokenURI || price < 0 || !duration) return;
        const bigPrice = price === 0 ? 0 : ethers.parseEther(price.toString())
        const startTimestamp = Date.now()
        const endTimestamp = startTimestamp + duration * 1000

        await writeContract({
            address: dropFactoryAddress,
            abi: DropFactoryABI,
            functionName: 'deployCollection',
            args: [
                implementationAddress,
                [
                    dropDetail.title,
                    dropDetail.symbol,
                    tokenURI,
                    dropDetail.supply,
                    bigPrice,
                    Math.floor(startTimestamp / 1000),
                    Math.floor(endTimestamp / 1000),
                    duration,
                    address,
                    dropDetail.royalty * 100
                ],
            ]
        }).then(async (res) => {
            if (!res.hash) return;
            const txnHash = res.hash;
            const result = await waitForTransaction({ hash: txnHash });
            if (result.status === 'success') {
                await saveDropDB(tokenURI, startTimestamp, endTimestamp, price, duration, dropDetail, setIsMinting)
            }
        })
    }

    const saveDropDB = async (tokenURI: string, startTimestamp: number, endTimestamp: number, price: number, duration: number, dropDetail: DropDetailTypes, setIsMinting: Dispatch<SetStateAction<boolean>>) => {
        if (!address || !chain || !dropDB) return;
        try {
            const dropContractAddress = await readContract({
                address: dropFactoryAddress,
                abi: DropFactoryABI,
                functionName: 'getDrops',
                args: [address]
            }) as `0x${string}`[]
            await createDropSchema();
            const dropDatabase = dropDB.collection('DropCollection');
            const id = tokenURI + startTimestamp;
            const editionArray = NetworkList.map(item => {
                if (item.id === chain?.id) {
                    return Number(dropDetail.supply)
                } else {
                    return 0
                }
            })
            await dropDatabase.create([
                id,
                dropDetail.title,
                dropDetail.description,
                dropDetail.symbol,
                tokenURI,
                editionArray,
                Number(price),
                Math.floor(startTimestamp / 1000),
                Math.floor(endTimestamp / 1000),
                Number(duration),
                address,
                Number(dropDetail.royalty),
                [NetworkList.find(item => item.id === chain?.id)?.network || ''],
                dropContractAddress[dropContractAddress.length - 1],
                [0, 0, 0],
                [],
            ]);
            setIsMinting(false)
        } catch (err) {
            console.log(err)
            setIsMinting(false)
        }
    }

    const getAvatarImage = (address: `0x${string}`) => {
        return `https://web3-images-api.kibalabs.com/v1/accounts/${address}/image`
    }

    const claim = async (contractAddress: `0x${string}`, buyAmount: number, buyedAmount: number[], pricePerToken: number, id: string) => {
        if (!dropDatabase) return;
        const currentCollecters = await dropDatabase.record(id).get();
        const currentCollectersData = currentCollecters.data.collecters;
        const currentUserImage = getAvatarImage(address as `0x${string}`)
        if (!currentCollectersData.map((item: string) => item.toLocaleLowerCase()).includes(currentUserImage.toLocaleLowerCase()))
            currentCollectersData.push(currentUserImage);
        try {
            const dropId = await readContract({
                address: contractAddress,
                abi: DropABI,
                functionName: 'tokenID'
            })
            const tokenIdNum = Number(dropId)
            const totalValue = pricePerToken * Number(buyAmount)
            const decimalLength = pricePerToken === 0 ? 0 : pricePerToken.toString().split('.')[1].length;
            await writeContract({
                address: contractAddress,
                abi: DropABI,
                functionName: 'claim',
                args: [
                    address,
                    buyAmount,
                ],
                value: ethers.parseEther(totalValue.toFixed(decimalLength))
            }).then(async (res) => {
                if (!res.hash) return;
                const txnHash = res.hash;
                const result = await waitForTransaction({ hash: txnHash });
                if (result.status === 'success') {
                    await updateDropDB(buyAmount, buyedAmount, id, currentCollectersData, tokenIdNum)
                }
            }).catch(err => {
                console.log(err)
            })
        } catch (err) {
            console.log(err)
        }
    }

    const updateBuyedAmount = (currentList: number[], amount: number) => {
        if (!chain?.id) return 0;
        const index = getNetworkIndex(chain?.id);
        currentList[index] = Number(currentList[index]) + Number(amount)
        return currentList
    }

    const updateDropDB = async (buyAmount: number, buyedAmount: number[], id: string, currentCollectersData: any, tokenIdNum: number) => {
        if (!address || !dropDatabase || !collecterDatabase || !chain?.id) return;
        const udpatedBuyedAmount = updateBuyedAmount(buyedAmount, buyAmount);
        await dropDatabase.record(id).call('updateBuyedAmount', [udpatedBuyedAmount]);
        await dropDatabase.record(id).call('updateCollecters', [currentCollectersData]);
        const collecterId = id + address + chain?.id
        const collecterData = await collecterDatabase.get();
        const collecterExist = collecterData.data.map(item => item.data.id).includes(collecterId);
        if (collecterExist) {
            const existCollecter = await collecterDatabase.record(collecterId).get();
            const amountList = existCollecter.data.amount;
            const tokenIdList = existCollecter.data.claimId;
            amountList.push(Number(buyAmount));
            if (!tokenIdList.includes(tokenIdNum)) {
                tokenIdList.push(tokenIdNum);
            }
            await collecterDatabase.record(collecterId).call('updateAmount', [amountList]);
            await collecterDatabase.record(collecterId).call('updateClaimId', [tokenIdList]);
        } else {
            await collecterDatabase.create([
                collecterId,
                id,
                address,
                [Number(buyAmount)],
                chain?.id,
                [tokenIdNum]
            ])
        }
    }

    return {
        createDrop,
        getDropData,
        claim
    }
}
