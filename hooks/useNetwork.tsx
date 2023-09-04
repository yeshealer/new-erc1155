import { useCallback, useEffect, useState } from "react"
import { getNetwork } from '@wagmi/core'

const useNetwork = () => {
    const { chain } = getNetwork();

    const [chainID, setChainID] = useState(0);

    const getChainID = useCallback(async () => {
        if (chain) {
            setChainID(chain.id)
        }
    }, [chain?.id])

    useEffect(() => {
        getChainID();
    }, [chain?.id])

    return {
        chainID,
        getChainID
    }
}

export default useNetwork