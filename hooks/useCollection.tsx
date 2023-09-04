import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { writeContract, waitForTransaction, readContract } from '@wagmi/core'
import { ethers } from "ethers";
import { useSnackbar } from 'notistack';
import { getCollectionDB } from "@/utils/polybaseHelper";
import SampModelFactoryABI from '@/constants/abi/SampModelFactory.json'
import { errorVariant, successVariant } from "@/utils/stickyHelper";
import useIPFS from "./useIPFS";
import { NetworkList } from "@/constants/main";

const useCollection = () => {
    const factoryContract = process.env.FACTORY_CONTRACT as `0x${string}`
    const referContract = process.env.REFER_CONTRACT as `0x${string}`

    const collectionDB = getCollectionDB();
    const { enqueueSnackbar } = useSnackbar();
    const { get3DImageLink } = useIPFS();

    const [isDeploying, setIsDeploying] = useState(false);

    const getCollectionData = useCallback(async (pathname: string) => {
        if (collectionDB) {
            const collectionReference = collectionDB.collection("CollectionData");
            const data = await collectionReference.get();
            const collection = data.data.find((item) => item.data.id === pathname) as any;
            return collection?.data
        }
    }, [])

    const getNFTData = useCallback(async (collection: any) => {
        if (collectionDB) {
            console.log(collection)
            const nftData = await (collectionDB.collection('NFTData')).get();
            const NFTs = nftData.data.filter((item) => item.data.collectionId === collection.data.id)
            let displayNFTData = []
            for (let i = 0; i < NFTs.length; i++) {
                const imageURL = await get3DImageLink(NFTs[i].data.imageURI)
                displayNFTData.push({
                    imageURL: imageURL,
                    networkImage: NetworkList.find(network => network.id === NFTs[i].data.network)?.image,
                    nftName: NFTs[i].data.name,
                    nftDescription: NFTs[i].data.description,
                    contractAddress: NFTs[i].data.contractAddress,
                    ownerAddress: NFTs[i].data.ownerAddress,
                    symbol: NFTs[i].data.symbol,
                    lastSynced: NFTs[i].data.lastSynced,
                    tokenId: NFTs[i].data.tokenId,
                    network: NFTs[i].data.network,
                    supply: NFTs[i].data.supply
                })
            }
            return displayNFTData;
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
            ],
            chainId: chainID
        }).then(res => {
            const handleNextAction = async () => {
                if (!res.hash) return;
                const txnHash = res.hash
                const result = await waitForTransaction({ hash: txnHash });
                if (result.status === 'success') {
                    const result = await saveCollectionDB(collectionData, chainID, pathname);
                    setCollectionInfo(result)
                    setIsDeploying(false)
                    enqueueSnackbar('Successfully deployed collection!', { variant: successVariant });
                }
            }
            handleNextAction();
        }).catch(err => {
            console.log(err)
            enqueueSnackbar('Deploy has been failed!', { variant: errorVariant });
            setIsDeploying(false)
        })
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
        saveCollectionDB,
        getNFTData
    }
}

export default useCollection