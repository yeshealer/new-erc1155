// ** react & next imports
import React, { useState } from "react";
import { useRouter } from "next/navigation";
// ** web3 imports
import { useAccount } from "wagmi";
import CryptoJS from 'crypto-js'
// ** UI module imports
import { Icon } from "@iconify/react";
import { useSnackbar } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from "@mui/material/Stack";
// ** constants & style imports
import { IconButton, Button } from "@/components/globalstyle";
import { getCollectionDB } from "@/utils/polybaseHelper";
import { errorVariant, successVariant, warningVariant } from "@/utils/stickyHelper";

export default function MainSection() {
    const { address } = useAccount();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const CollectionDB = getCollectionDB();

    const [collectionName, setCollectionName] = useState('');
    const [collectionSymbol, setCollectionSymbol] = useState('');
    const [maxSupply, setMaxSupply] = useState<string>('0');
    const [isLoading, setIsLoading] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [price, setPrice] = useState<string>('0');
    const [recipient, setRecipient] = useState('');
    const [percentage, setPercentage] = useState<string>('0');

    const encryptString = (str: string) => {
        const encrypted = CryptoJS.AES.encrypt(str, 'FetaERC1155').toString();
        const encryptedData = encrypted.replaceAll('/', '-');
        return encryptedData;
    }

    const createCollection = async () => {
        try {
            if (collectionName == '' || collectionSymbol == '' || Number(maxSupply) <= 0 || Number(price) <= 0 || recipient == '' || Number(percentage) <= 0) {
                enqueueSnackbar('Please fill out empty box!', { variant: errorVariant });
            } else if (Number(percentage) > 50) {
                enqueueSnackbar("Percentage can't be greater than 50%", { variant: errorVariant });
            } else {
                setIsLoading(true)
                await CollectionDB.applySchema(`
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
                const collectionReference = CollectionDB.collection("CollectionData");
                const id = encryptString(collectionName + collectionSymbol)

                await collectionReference.create([
                    id,
                    address as `0x${string}`,
                    collectionName,
                    collectionSymbol,
                    Number(maxSupply),
                    Number(price),
                    'ERC-1155',
                    recipient,
                    Number(percentage) * 100,
                    [],
                    '',
                    isPublic
                ]);
                setIsLoading(false)
                enqueueSnackbar("Saved collection successfully!", { variant: successVariant });
                // router.push('/create');
            }
        } catch (err: any) {
            console.log(err);
            if (err.code === 'already-exists') {
                enqueueSnackbar("Collection name already exists!", { variant: warningVariant });
            }
            setIsLoading(false)
        }
    }

    return (
        <Stack direction='row' alignItems='center' justifyContent='center' className="px-3">
            {isLoading ? (
                <Stack
                    justifyContent='center'
                    alignItems='center'
                    sx={{ minHeight: 'calc(100vh - 100px)' }}
                >
                    <CircularProgress />
                </Stack>
            ) : (
                <Stack className="max-w-7xl w-full relative">
                    <div className="w-full flex items-center justify-between">
                        <IconButton
                            onClick={() => router.push('/create')}
                        >
                            <Icon icon="solar:undo-left-bold" fontSize={20} />
                        </IconButton>
                        <div className="text-center text-3xl sm:text-4xl font-bold">Create Collection</div>
                        <div className="flex items-center gap-2">
                            <div className={`${isPublic ? 'text-lime-500' : 'text-rose-500'} font-semibold`}>{isPublic ? 'Public' : 'Private'}</div>
                            <label className="swap" onChange={() => { setIsPublic((prevState) => !prevState) }}>
                                <input type="checkbox" />
                                <Icon icon="ph:eye-duotone" className="swap-on fill-current text-sky-500" fontSize={30} />
                                <Icon icon="ph:eye-slash-duotone" className="swap-off fill-current text-sky-500" fontSize={30} />
                            </label>
                        </div>
                    </div>

                    <div className="w-full mt-5">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-10">
                            <div className="w-full">
                                <span className="badge badge-info text-white">Name *</span>
                                <input
                                    type="text"
                                    placeholder="Enter Name"
                                    className="input input-bordered input-info w-full mt-3"
                                    value={collectionName ? collectionName : ''}
                                    onChange={(e) => { setCollectionName(e.target.value); }}
                                />
                            </div>
                            <div className="w-full">
                                <span className="badge badge-info text-white">Symbol *</span>
                                <input
                                    type="text"
                                    placeholder="Enter Symbol"
                                    className="input input-bordered input-info w-full mt-3"
                                    value={collectionSymbol ? collectionSymbol : ''}
                                    onChange={(e) => { setCollectionSymbol(e.target.value); }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-10 mt-5">
                            <div className="w-full">
                                <span className="badge badge-info text-white">Max Supply *</span>
                                <input
                                    type="number"
                                    placeholder="Enter Max Supply"
                                    className="input input-bordered input-info w-full mt-3"
                                    value={maxSupply ? maxSupply : ''}
                                    onChange={(e) => { setMaxSupply(e.target.value); }}
                                />
                            </div>
                            <div className="w-full">
                                <span className="badge badge-info text-white">Token Price (Native Currency) *</span>
                                <input
                                    type="number"
                                    placeholder="Enter Price"
                                    className="input input-bordered input-info w-full mt-3"
                                    value={price ? price : ''}
                                    onChange={(e) => { setPrice(e.target.value); }}
                                />
                            </div>
                        </div>
                        <div className="mt-5">
                            <span className="badge badge-info text-white">Token Standard *</span>
                            <div className="mt-3">
                                <select className="select select-info w-full">
                                    <option>ERC-1155</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-10 mt-5">
                            <div className="w-full">
                                <span className="badge badge-info text-white">Recipient Address *</span>
                                <input
                                    type="text"
                                    placeholder="Enter Address"
                                    className="input input-bordered input-info w-full mt-3"
                                    value={recipient ? recipient : ''}
                                    onChange={(e) => { setRecipient(e.target.value); }}
                                />
                            </div>
                            <div className="w-full">
                                <span className="badge badge-info text-white">Percentage (%) *</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="input input-bordered input-info w-full mt-3"
                                    value={percentage ? percentage : ''}
                                    onChange={(e) => { setPercentage(e.target.value); }}
                                />
                            </div>
                        </div>
                    </div>

                    <Button className="w-full my-5 justify-center" onClick={createCollection}>Save</Button>
                    {/* <ToastContainer position="top-right" autoClose={3000} /> */}
                </Stack>
            )}
        </Stack >
    )
}