import { ethPersonalSign } from '@polybase/eth'
import { Polybase } from "@polybase/client"
import { POLYBASE_BASE_URL, POLYBASE_COLLECTION, POLYBASE_DROP } from '@/constants/config'

const privateKey = process.env.POLYBASE_PRIVATE_KEY
const publicKey = process.env.POLYBASE_PUBLIC_KEY
const BASE_URL = POLYBASE_BASE_URL

export const getCollectionDB = () => {
    const db = new Polybase({
        signer: (data) => {
            return {
                h: 'eth-personal-sign',
                sig: ethPersonalSign(privateKey as string, data)
            }
        },
        defaultNamespace: `pk/${publicKey}/${POLYBASE_COLLECTION}`,
        baseURL: `${BASE_URL}/v0`
    })
    return db
}

export const getDropDB = () => {
    const db = new Polybase({
        signer: (data) => {
            return {
                h: 'eth-personal-sign',
                sig: ethPersonalSign(privateKey as string, data)
            }
        },
        defaultNamespace: `pk/${publicKey}/${POLYBASE_DROP}`,
        baseURL: `${BASE_URL}/v0`
    })
    return db
}


export const createCollectionSchema = async () => {
    const collectionDB = getCollectionDB();
    await collectionDB.applySchema(`
        @public
        collection NFTData {
            id: string;
            imageURI: string;
            collectionId: string;
            supply: number;
            name: string;
            description: string;
            network: number;
            tokenId: number;
            contractAddress: string;
            ownerAddress: string;
            symbol: string;
            lastSynced: string;

            constructor (id: string, imageURI: string, collectionId: string, supply: number, name: string, description: string, network: number, tokenId: number, contractAddress: string, ownerAddress: string, symbol: string, lastSynced: string) {
                this.id = id;
                this.imageURI = imageURI;
                this.collectionId = collectionId;
                this.supply = supply;
                this.name = name;
                this.description = description;
                this.network = network;
                this.tokenId = tokenId;
                this.contractAddress = contractAddress;
                this.ownerAddress = ownerAddress;
                this.symbol = symbol;
                this.lastSynced = lastSynced;
            }

            updateSupply(newSupply: number) {
                this.supply = newSupply;
            }

            updateSynced(newSynced: string) {
                this.lastSynced = newSynced;
            }

            del () {
                selfdestruct();
            }
        }

        @public
        collection CollectionData {
            id: string;
            wallet: string;
            collectionName: string;
            symbol: string;
            maxSupply: number;
            tokenPrice: number;
            tokenStandard: string;
            recipientAddress: string;
            recipientPercentage: number;
            deployedNetwork: number[];
            deployedAddress: string;
            isPublic: boolean;

            constructor (id: string, wallet: string, collectionName: string, symbol: string, maxSupply: number, tokenPrice: number, tokenStandard: string, recipientAddress: string, recipientPercentage: number, deployedNetwork: number[], deployedAddress: string, isPublic: boolean) {
                this.id = id;
                this.wallet = wallet;
                this.collectionName = collectionName;
                this.symbol = symbol;
                this.maxSupply = maxSupply;
                this.tokenPrice = tokenPrice;
                this.tokenStandard = tokenStandard;
                this.recipientAddress = recipientAddress;
                this.recipientPercentage = recipientPercentage;
                this.deployedNetwork = deployedNetwork;
                this.deployedAddress = deployedAddress;
                this.isPublic = isPublic;
            }

            updateDeployedNetwork(deployingNetwork: number[]) {
                this.deployedNetwork = deployingNetwork;
            }

            updateDeployedAddress(deployAddress: string) {
                this.deployedAddress = deployAddress;
            }

            updatePublic(newIsPublic: boolean) {
                this.isPublic = newIsPublic;
            }

            del () {
                selfdestruct();
            }
        }`
    );
}

export const createDropSchema = async () => {
    const dropDB = getDropDB();
    await dropDB.applySchema(`
        @public
        collection DropCollection {
            id: string;
            title: string;
            description: string;
            symbol: string;
            baseURI: string;
            maxEditions: number[];
            pricePerToken: number;
            startTimestamp: number;
            endTimestamp: number;
            duration: number;
            royalReceiver: string;
            royalFee: number;
            network: string[];
            contractAddress: string;
            buyedAmount: number[];
            collecters: string[];

            constructor (id: string, title: string, description: string, symbol: string, baseURI: string, maxEditions: number[], pricePerToken: number, startTimestamp: number, endTimestamp: number, duration: number, royalReceiver: string, royalFee: number, network: string[], contractAddress: string, buyedAmount: number[], collecters: string[]) {
                this.id = id;
                this.title = title;
                this.description = description;
                this.symbol = symbol;
                this.baseURI = baseURI;
                this.maxEditions = maxEditions;
                this.pricePerToken = pricePerToken;
                this.startTimestamp = startTimestamp;
                this.endTimestamp = endTimestamp;
                this.duration = duration;
                this.royalReceiver = royalReceiver;
                this.royalFee = royalFee;
                this.network = network;
                this.contractAddress = contractAddress;
                this.buyedAmount = buyedAmount;
                this.collecters = collecters;
            }

            updateNetwork(updatedNetwork: string[]) {
                this.network = updatedNetwork;
            }

            updateBuyedAmount(updatedbuyedAmount: number[]) {
                this.buyedAmount = updatedbuyedAmount;
            }

            updateMaxEdition(updatedMaxEdition: number[]) {
                this.maxEditions = updatedMaxEdition;
            }

            updateCollecters(updatedCollecters: string[]) {
                this.collecters = updatedCollecters;
            }

            updateContractAddress(updatedContractAddress: string) {
                this.contractAddress = updatedContractAddress;
            }

            del () {
                selfdestruct();
            }
        }

        @public
        collection CollecterCollection {
            id: string;
            dropId: string;
            collecter: string;
            amount: number[];
            network: number;
            claimId: number[];

            constructor (id: string, dropId: string, collecter: string, amount: number[], network: number, claimId: number[]) {
                this.id = id;
                this.dropId = dropId;
                this.collecter = collecter;
                this.amount = amount;
                this.network = network;
                this.claimId = claimId;
            }

            updateAmount(updatedAmount: number[]) {
                this.amount = updatedAmount;
            }

            updateClaimId(updatedClaimId: number[]) {
                this.claimId = updatedClaimId;
            }
            
            del () {
                selfdestruct();
            }
        }`
    );
}