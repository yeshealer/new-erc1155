import { readContract, multicall, writeContract, waitForTransaction } from '@wagmi/core'
import FetaMarketABI from '@/constants/abi/FetaMarket.json'
import useDrop from './useDrop'
import { DetailsType } from '@/constants/type'
import { useAccount } from 'wagmi'
import DropABI from '@/constants/abi/Drop.json'

const useDropDetail = () => {
    const fetaMarketAddress = process.env.FETA_MARKET_CONTRACT

    const {
        getDropData,
        getCollecterData
    } = useDrop();

    const fetchMainData = async (details: DetailsType) => {
        const dropData = await getDropData();
        const collecterData = await getCollecterData();
        if (!dropData || !Array(dropData) || !collecterData || !Array(collecterData)) return;
        const matchDrop = dropData.find(item => item.contractAddress === details.contractAddress)
        const matchCollecterData = collecterData.find(item => item.dropId === matchDrop.id && String(item.network) === details.network && String(item.claimId[0]) === details.tokenID && details.ownerAddress === item.collecter)
        const activeUser = collecterData.filter(item => item.dropId === matchDrop.id && String(item.network) === details.network)

        return { matchDrop, matchCollecterData, activeUser }
    }

    const fetchTokenPrice = async (nftData: any) => {
        const metaData = await readContract({
            address: nftData.contractAddress,
            abi: DropABI,
            functionName: 'metaData'
        }) as any
        const tokenPrice = Number(metaData[4]) / 1e18
        return tokenPrice
    }

    return {
        fetchMainData,
        fetchTokenPrice
    }
}

export default useDropDetail