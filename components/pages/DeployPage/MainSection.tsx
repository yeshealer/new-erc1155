// ** react & next imports
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from "next/navigation";
// ** UI module imports
import { Icon } from "@iconify/react";
import Stack from "@mui/material/Stack";
// ** style & constants imports
import { IconButton } from "@/components/globalstyle";
import { NetworkList } from '@/constants/main';
// ** web3 imports
import { useAccount, useNetwork, useBalance, useSwitchNetwork } from 'wagmi';
import { ethers } from 'ethers'
// ** utils & provider & abis
import SampModelFactoryABI from '@/constants/abi/SampModelFactory.json'
import { getCollectionDB } from '@/utils/polybaseHelper';

export default function MainSection() {
    const factoryContract = process.env.REACT_APP_FACTORY_CONTRACT
    const referContract = process.env.REACT_APP_REFER_CONTRACT

    const [isLoading, setIsLoading] = useState(false);
    const [collectionData, setCollectionData] = useState<any>();
    const [selectedId, setSelectedId] = useState<number | undefined>();

    const router = useRouter();
    const { chain } = useNetwork();
    const { address } = useAccount();
    const { data: balance } = useBalance({
        address: address,
    })
    const { isLoading: switching, switchNetwork } = useSwitchNetwork()

    const collectionDB = getCollectionDB();

    // const handleDeploy = async () => {
    //     if (!isLoadingBtn) {
    //         if (selectedId === chain.id) {
    //             setIsLoadingBtn(true)
    //             try {
    //                 const bigPrice = collectionData.tokenPrice !== 0 ? ethers.utils.parseEther(collectionData.tokenPrice.toString()) : 0;

    //                 await writeContract({
    //                     address: factoryContract,
    //                     abi: sampModelFactoryABI,
    //                     functionName: 'deployCollection',
    //                     args: [
    //                         referContract,
    //                         collectionData.collectionName,
    //                         collectionData.symbol,
    //                         'ipfs://',
    //                         collectionData.maxSupply,
    //                         bigPrice,
    //                         collectionData.recipientAddress,
    //                         collectionData.recipientPercentage,
    //                         collectionData.isPublic,
    //                         {
    //                             gasLimit: 2000000
    //                         }
    //                     ]
    //                 }).then(res => {
    //                     const handleNextAction = async () => {
    //                         const result = await res.wait();
    //                         if (result.status === 1) {
    //                             const currentNetworks = collectionData.deployedNetwork
    //                             currentNetworks.push(chain.id)
    //                             await collectionReference.record(collectionData.id).call('updateDeployedNetwork', [currentNetworks])

    //                             const deployedAddress = await readContract({
    //                                 address: factoryContract,
    //                                 abi: sampModelFactoryABI,
    //                                 functionName: 'getTotlDeploys',
    //                             })
    //                             await collectionReference.record(collectionData.id).call('updateDeployedAddress', [deployedAddress[deployedAddress.length - 1]])
    //                             await getCollectionData();

    //                             successNotify();
    //                             setIsLoadingBtn(false);
    //                         }
    //                     }
    //                     handleNextAction();
    //                 }).catch(err => {
    //                     console.log(err)
    //                     setIsLoadingBtn(false)
    //                 })
    //             } catch (err) {
    //                 console.log(err);
    //                 if (err.code === 'INVALID_ARGUMENT') {
    //                     invalidNotify()
    //                 }
    //                 setIsLoadingBtn(false)
    //             }
    //         }
    //     }
    // }

    const getCollectionData = useCallback(async () => {
        if (collectionDB) {
            const collectionReference = collectionDB.collection("CollectionData");
            const data = await collectionReference.get();
            const pathname = location.pathname.slice(8, location.pathname.length);
            const collection = data.data.find((item) => item.data.id === pathname) as any;
            setCollectionData(collection.data);
        }
    }, [])

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true)
                await getCollectionData();
                setIsLoading(false)
            } catch (err) {
                console.log(err)
                setIsLoading(false)
            }
        })()
    }, [selectedId])

    useEffect(() => {
        setSelectedId(chain?.id)
    }, [chain?.id])

    return (
        <Stack direction='row' alignItems='center' justifyContent='center' className="px-3">
            {isLoading ? (
                <Stack
                    justifyContent='center'
                    alignItems='center'
                    sx={{ minHeight: 'calc(100vh - 100px)' }}
                >
                    <span className="loading loading-bars loading-lg text-info"></span>
                </Stack>
            ) : (
                <Stack className="max-w-7xl w-full relative">
                    <div className="w-full flex items-center justify-between ">
                        <IconButton
                            onClick={() => router.push('/create')}
                            className="absolute left-0"
                        >
                            <Icon icon="solar:undo-left-bold" fontSize={20} />
                        </IconButton>
                        <p className={`text-center text-3xl sm:text-4xl font-bold w-full`}>Deploy Collection</p>
                    </div>
                    <div className='divider' />
                    {collectionData && (
                        <div className='w-full'>
                            <div>
                                <div className='badge badge-info text-white'>Collection Name</div>
                                <div className='text-2xl font-semibold'>{collectionData.collectionName}</div>
                                <p className='text-gray-500 text-sm'>Select a network to deploy your collection. Deploying your collection on each network is required to bridge NFTs between those networks.</p>
                            </div>
                            <div className='divider'>Deploy on the network</div>
                            <div className='flex items-start justify-between gap-10'>
                                {NetworkList.map((item) => {
                                    const isDeployed = collectionData.deployedNetwork.includes(item.id);
                                    return (
                                        <div className='w-full'>
                                            <div className="mockup-window border border-base-300">
                                                <div className="flex flex-col px-6 py-4 pb-2 border-t border-base-300">
                                                    <div className='flex items-center justify-between w-full'>
                                                        <div className='flex items-center gap-4 text-xl font-semibold'>
                                                            <img src={item.image} alt="network icon" width={30} height={30} draggable={false} />
                                                            {item.network}
                                                        </div>
                                                        {isDeployed ? <span className="badge badge-accent text-white">Deployed</span> : switching ? <span></span> : <span className="badge">Not live</span>}
                                                    </div>
                                                    {item.id === selectedId ? (
                                                        <div className='text-gray-500 text-sm flex items-center justify-between w-full mt-3.5'>
                                                            <div className='px-2'>
                                                                Balance: {Number(balance?.formatted).toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 0 })} {item.currency}
                                                            </div>
                                                            <div className="badge badge-info text-white gap-2">
                                                                Connected
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button className={`btn btn-xs btn-block btn-primary btn-outline mt-2`} onClick={() => switchNetwork?.(item.id)}>
                                                            {switching && <span className="loading loading-spinner"></span>}
                                                            {switching ? '' : 'Switch Network'}
                                                        </button>
                                                    )}
                                                </div>
                                                <div className='divider my-0' />
                                                <div className='px-6 py-2 pt-0'>
                                                    {isDeployed ? (
                                                        <button className="btn btn-sm btn-block btn-accent text-white" onClick={() => window.open(`${NetworkList.find(network => network.id === item.id)?.explorer}${collectionData.deployedAddress}`)}>
                                                            {collectionData.deployedAddress.slice(0, 5) + '...' + collectionData.deployedAddress.slice(-5)}
                                                            <Icon icon="tabler:external-link" fontSize={18} />
                                                        </button>
                                                    ) : (
                                                        <button className="btn btn-sm btn-block btn-info text-white">Deploy</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </Stack>
            )}
        </Stack>
    )
}
