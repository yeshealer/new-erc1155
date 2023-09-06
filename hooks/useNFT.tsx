import { readContract, writeContract } from '@wagmi/core'
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import SampModelABI from '@/constants/abi/SampModel.json'

const useNFT = () => {
    const { address } = useAccount();

    const mint = async (collectionData: any, tokenURI: string, nftSupply: number) => {
        const metaData = await readContract({
            address: collectionData.deployedAddress,
            abi: SampModelABI,
            functionName: 'metaData',
        }) as any
        console.log(metaData)
        // await writeContract({
        //     address: collectionData.deployedAddress,
        //     abi: SampModelABI,
        //     functionName: 'mint',
        //     args: [
        //         address,
        //         nftSupply,
        //         tokenURI,
        //         {
        //             value: ethers.parseEther(new BigNumber(Number(metaData.tokenPrice)).multipliedBy(nftSupply).dividedBy(1e18).toString()),
        //         }
        //     ]
        // })
    }

    return {
        mint
    }
}

export default useNFT