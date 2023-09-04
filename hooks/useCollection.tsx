import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { writeContract, waitForTransaction, readContract } from '@wagmi/core'
import { ethers } from "ethers";
import { getCollectionDB } from "@/utils/polybaseHelper";
import SampModelFactoryABI from '@/constants/abi/SampModelFactory.json'

const useCollection = () => {
    const factoryContract = process.env.FACTORY_CONTRACT as `0x${string}`
    const referContract = process.env.REFER_CONTRACT as `0x${string}`

    const collectionDB = getCollectionDB();

    const [isDeploying, setIsDeploying] = useState(false);

    const getCollectionData = useCallback(async (pathname: string) => {
        if (collectionDB) {
            const collectionReference = collectionDB.collection("CollectionData");
            const data = await collectionReference.get();
            const collection = data.data.find((item) => item.data.id === pathname) as any;
            return collection.data
        }
    }, [])

    const deploy = useCallback(async (
        collectionData: any,
        chainID: number,
        pathname: string,
        setCollectionInfo: Dispatch<SetStateAction<any>>
    ) => {
        setIsDeploying(true)
        const bigPrice = collectionData.tokenPrice !== 0 ? ethers.parseEther(collectionData.tokenPrice.toString()) : 0;
        await writeContract({
            address: factoryContract,
            abi: SampModelFactoryABI,
            functionName: 'deployCollection',
            args: [
                referContract,
                collectionData.collectionName,
                collectionData.symbol,
                'ipfs://',
                collectionData.maxSupply,
                bigPrice,
                collectionData.recipientAddress,
                collectionData.recipientPercentage,
                collectionData.isPublic
            ]
        }).then(res => {
            const handleNextAction = async () => {
                if (!res.hash) return;
                const txnHash = res.hash
                const result = await waitForTransaction({ hash: txnHash });
                if (result.status === 'success') {
                    const result = await saveCollectionDB(collectionData, chainID, pathname);
                    setCollectionInfo(result)
                }
            }
            handleNextAction();
        }).catch(err => {
            console.log(err)
        })
        setIsDeploying(false)
    }, [])

    const saveCollectionDB = async (collectionInfo: any, chainID: number, pathname: string) => {
        if (collectionDB) {
            const collectionReference = collectionDB.collection("CollectionData");
            const currentNetworks = collectionInfo.deployedNetwork
            currentNetworks.push(chainID)
            await collectionReference.record(collectionInfo.id).call('updateDeployedNetwork', [currentNetworks])

            const deployedAddress = await readContract({
                address: factoryContract,
                abi: SampModelFactoryABI,
                functionName: 'getTotlDeploys',
            }) as string[]
            await collectionReference.record(collectionInfo.id).call('updateDeployedAddress', [deployedAddress[deployedAddress.length - 1]])
            const result = await getCollectionData(pathname);
            return result;
        }
    }

    return {
        isDeploying,
        getCollectionData,
        deploy,
        saveCollectionDB
    }
}

export default useCollection