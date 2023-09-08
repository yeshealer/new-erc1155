import { readContract, writeContract, waitForTransaction } from '@wagmi/core'
import { useAccount, useNetwork } from "wagmi";
import { ethers } from "ethers";
import { useSnackbar } from 'notistack';
import SampModelABI from '@/constants/abi/SampModel.json'
import { infoVariant } from '@/utils/stickyHelper';
import { getCollectionDB } from '@/utils/polybaseHelper';

const useNFT = () => {
    const { address } = useAccount();
    const { enqueueSnackbar } = useSnackbar();
    const collectionDB = getCollectionDB();
    const { chain } = useNetwork();

    const mint = async (collectionData: any, tokenURI: string, nftSupply: number, nftName: string, nftDescription: string) => {
        try {
            const metaData = await readContract({
                address: collectionData.deployedAddress,
                abi: SampModelABI,
                functionName: 'metaData',
            }) as any
            if (metaData[3] < nftSupply) {
                enqueueSnackbar('You can mint the NFT bigger than Collection total supply!', { variant: infoVariant })
                return;
            }
            await writeContract({
                address: collectionData.deployedAddress,
                abi: SampModelABI,
                functionName: 'mint',
                args: [
                    address,
                    nftSupply,
                    tokenURI
                ],
                value: ethers.parseEther((Number(metaData[4]) * nftSupply / 1e18).toString())
            }).then(async (res) => {
                if (!res.hash) return;
                const txnHash = res.hash;
                const result = await waitForTransaction({ hash: txnHash });
                console.log(result)
                if (result.status === 'success') {
                    await saveNFTDB(collectionData, tokenURI, nftSupply, nftName, nftDescription)
                }
            })
        } catch (err) {
            console.log(err)
        }
    }

    const saveNFTDB = async (collectionData: any, tokenURI: string, nftSupply: number, nftName: string, nftDescription: string) => {
        if (collectionDB) {
            const nftData = collectionDB.collection('NFTData');
            const tokenId = await readContract({
                address: collectionData.deployedAddress,
                abi: SampModelABI,
                functionName: 'getNextTokenId',
            })

            const tokenIdNum = Number(tokenId) - 1

            const today = new Date();
            const dateString = today.toLocaleDateString('en-US');

            await nftData.create([
                tokenURI + chain?.id + tokenIdNum + address,
                tokenURI,
                collectionData.id,
                Number(nftSupply),
                nftName,
                nftDescription,
                Number(chain?.id),
                tokenIdNum,
                collectionData.deployedAddress,
                address,
                collectionData.symbol,
                dateString
            ])
        }
    }

    return {
        mint
    }
}

export default useNFT