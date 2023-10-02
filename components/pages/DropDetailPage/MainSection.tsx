import { Stack } from "@mui/material"
import { useEffect, useState } from "react"
import { useParams } from 'next/navigation';
import useNFTDetail from "@/hooks/useNFTDetail";
import { DetailsType } from "@/constants/type";
import { useAccount, useNetwork } from "wagmi";
import { switchNetwork } from '@wagmi/core'
import Divider from '@mui/material/Divider';
import { Icon } from "@iconify/react";
import ModelViewer from "@/components/widgets/ModelViewer";
import NFTDescription from "./NFTDescription";
import Title from "./Title";
import Tabs from "./Tabs";
import ListingsSection from "./ListingsSection";
import OffersSection from "./OffersSection";
import CreateListModal from "./CreateListModal";
import MakeOfferModal from "./MakeOfferModal";
import useDropDetail from "@/hooks/useDropDetail";

export default function MainSection() {
    const params = useParams();
    const { isConnected } = useAccount();
    const { chain } = useNetwork();

    const {
        fetchSaleList,
        fetchOfferList
    } = useNFTDetail();

    const {
        fetchMainData,
        fetchTokenPrice
    } = useDropDetail();

    const [isLoading, setIsLoading] = useState(false);
    const [details, setDetails] = useState<DetailsType>();
    const [dropData, setDropData] = useState<any>();
    const [collecterData, setCollecterData] = useState<any>();
    const [availableUsers, setAvailableUsers] = useState<any>();
    const [tokenPrice, setTokenPrice] = useState<number>(0);
    const [totalList, setTotalList] = useState<any>();
    const [totalOffer, setTotalOffer] = useState<any>();
    const [sellListItemCount, setSellListItemCount] = useState(1);
    const [sellOfferItemCount, setSellOfferItemCount] = useState(1);

    const getMainData = async () => {
        try {
            setIsLoading(true)
            if (!details) return;
            const mainData = await fetchMainData(details);
            if (!mainData) return;
            console.log(mainData)
            setDropData(mainData.matchDrop)
            setCollecterData(mainData.matchCollecterData)
            setAvailableUsers(mainData.activeUser)
            const tokenPrice = await fetchTokenPrice(mainData.matchDrop)
            const latestSaleList = await fetchSaleList(mainData.matchDrop)
            const latestOfferList = await fetchOfferList(mainData.matchDrop)
            setTokenPrice(tokenPrice)
            setTotalList(latestSaleList)
            setTotalOffer(latestOfferList)
            setIsLoading(false)
        } catch (err) {
            console.log(err)
        }
    }

    const openCreateListModal = () => {
        if (typeof document !== 'undefined') {
            (document.getElementById('create_list_modal') as HTMLDialogElement)?.showModal();
        }
    }

    const closeCreateListModal = () => {
        if (typeof document !== 'undefined') {
            (document.getElementById('create_list_modal') as HTMLDialogElement)?.close();
        }
    }

    const openMakeOfferModal = () => {
        if (typeof document !== 'undefined') {
            (document.getElementById('make_offer_modal') as HTMLDialogElement)?.showModal();
        }
    }

    const closeMakeOfferModal = () => {
        if (typeof document !== 'undefined') {
            (document.getElementById('make_offer_modal') as HTMLDialogElement)?.close();
        }
    }

    useEffect(() => {
        if (!params || !params.drop) return;
        setDetails({
            contractAddress: params.drop[0] as string,
            network: params.drop[1] as string,
            tokenID: params.drop[2] as string,
            ownerAddress: params.drop[3] as string
        })
        if (Number(params.drop[1]) !== chain?.id) {
            (async () => {
                await switchNetwork({
                    chainId: Number(params.drop[1])
                });
            })();
        }
    }, [JSON.stringify(params?.drop)])

    useEffect(() => {
        if (!isConnected) return;
        if (!details || Number(details?.network) !== chain?.id) return;
        getMainData();
    }, [details, isConnected, chain?.id])

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
                    {(dropData && collecterData) && (
                        <Stack className='w-full' direction={{ xs: 'column', md: 'row' }} justifyContent={'space-between'}>
                            <Stack width={{ xs: 'full', md: '40%' }}>
                                <Title nftData={dropData} collection={collecterData} />
                                <Stack className="w-full aspect-square">
                                    <ModelViewer prevURL={dropData.imageURL} />
                                </Stack>
                                <Stack className="mt-2">
                                    <NFTDescription nftData={dropData} collection={collecterData} />
                                </Stack>
                            </Stack>
                            <Stack width={{ xs: 'full', md: '55%' }}>
                                <Title nftData={dropData} collection={collecterData} isShow />
                                <Stack direction='row' alignItems='center' mb={2} gap={2}>
                                    {availableUsers && (
                                        <Stack direction='row' alignItems='center' gap={0.5}>
                                            <Icon icon="ph:users-duotone" fontSize={18} />
                                            {availableUsers.length} owner
                                        </Stack>
                                    )}
                                    <Stack direction='row' alignItems='center' gap={0.5}>
                                        <Icon icon="ant-design:table-outlined" fontSize={18} />
                                        {dropData.buyedAmount.reduce((acc: number, cur: number) => { return acc + cur }, 0)} items
                                    </Stack>
                                </Stack>
                                <Divider />
                                <Tabs
                                    nftData={dropData}
                                    collection={collecterData}
                                    sellListItemCount={sellListItemCount}
                                    setSellListItemCount={setSellListItemCount}
                                    sellOfferItemCount={sellOfferItemCount}
                                    setSellOfferItemCount={setSellOfferItemCount}
                                    openCreateListModal={openCreateListModal}
                                    openMakeOfferModal={openMakeOfferModal}
                                />
                                <Divider />
                                <ListingsSection
                                    totalListings={totalList}
                                    nftData={dropData}
                                    availableUsers={availableUsers}
                                    getMainData={getMainData}
                                />
                                <OffersSection
                                    totalOffers={totalOffer}
                                    nftData={dropData}
                                    availableUsers={availableUsers}
                                    getMainData={getMainData}
                                />
                                {dropData && (
                                    <>
                                        <CreateListModal
                                            nftData={dropData}
                                            collection={collecterData}
                                            tokenPrice={tokenPrice}
                                            sellListItemCount={sellListItemCount}
                                            setSellListItemCount={setSellListItemCount}
                                            setTokenPrice={setTokenPrice}
                                            closeCreateListModal={closeCreateListModal}
                                            getMainData={getMainData}
                                        />
                                        <MakeOfferModal
                                            nftData={dropData}
                                            collection={collecterData}
                                            tokenPrice={tokenPrice}
                                            sellOfferItemCount={sellOfferItemCount}
                                            setSellOfferItemCount={setSellOfferItemCount}
                                            setTokenPrice={setTokenPrice}
                                            closeMakeOfferModal={closeMakeOfferModal}
                                            getMainData={getMainData}
                                        />
                                    </>
                                )}
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            )}
        </Stack>
    )
}
