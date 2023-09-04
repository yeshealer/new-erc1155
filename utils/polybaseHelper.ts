import { ethPersonalSign } from '@polybase/eth'
import { Polybase } from "@polybase/client"

const privateKey = process.env.POLYBASE_PRIVATE_KEY
const publicKey = process.env.POLYBASE_PUBLIC_KEY
const BASE_URL = `https://testnet.polybase.xyz`

export const getCollectionDB = () => {
    const db = new Polybase({
        signer: (data) => {
            return {
                h: 'eth-personal-sign',
                sig: ethPersonalSign(privateKey as string, data)
            }
        },
        defaultNamespace: `pk/${publicKey}/collectiondata67`,
        baseURL: `${BASE_URL}/v0`
    })
    return db
}