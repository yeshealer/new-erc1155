import { readContract, writeContract, waitForTransaction } from '@wagmi/core'
import DropFactoryABI from '@/constants/abi/DropFactory.json'
import { DropDetailTypes } from '@/constants/type'
import { ethers } from 'ethers'
import { useAccount, useNetwork } from 'wagmi'
import { createDropSchema, getDropDB } from '@/utils/polybaseHelper'
import { NetworkList } from '@/constants/main'

export default function useDrop() {
    const dropFactoryAddress = process.env.DROP_FACTORY_CONTRACT as `0x${string}`
    const implementationAddress = process.env.DROP_IMPLEMENTATION_CONTRACT as `0x${string}`

    const { address } = useAccount();
    const { chain } = useNetwork();

    const dropDB = getDropDB();

    const getDropData = async () => {
        if (!dropDB) return;
        const collectionReference = dropDB.collection("DropCollection");
        const data = await collectionReference.get();
        const dropData = data.data.map(item => item.data)
        return dropData
    }

    const createDrop = async (dropDetail: DropDetailTypes, tokenURI: string, price: number, duration: number) => {
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
                await saveDropDB(tokenURI, startTimestamp, endTimestamp, price, duration, dropDetail)
            }
        })
    }

    const saveDropDB = async (tokenURI: string, startTimestamp: number, endTimestamp: number, price: number, duration: number, dropDetail: DropDetailTypes) => {
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
        } catch (err) {
            console.log(err)
        }
    }

    return {
        createDrop,
        getDropData
    }
}
