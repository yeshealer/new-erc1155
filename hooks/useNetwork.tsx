import { NetworkList } from "@/constants/main";
import { switchNetwork } from '@wagmi/core';

const useNetwork = () => {
    const getNetworkIndex = (chainId: number) => {
        const index = chainId === NetworkList[0].id ? 0 : chainId === NetworkList[1].id ? 1 : chainId === NetworkList[2].id ? 2 : 0;
        return index
    }

    const changeNetwork = async (chainId: number) => {
        try {
            await switchNetwork({
                chainId: chainId
            })
        } catch (err) {
            console.log(err)
        }
    }

    return {
        getNetworkIndex,
        changeNetwork
    }
}

export default useNetwork