import { Stack, Typography } from "@mui/material"
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

export default function MainSection() {
    const params = useParams();
    const { isConnected } = useAccount();
    const { chain } = useNetwork();

    const {
        fetchMainData,
        fetchTokenPrice,
        fetchSaleList,
        fetchOfferList
    } = useNFTDetail();

    const [isLoading, setIsLoading] = useState(false);
    const [details, setDetails] = useState<DetailsType>();
    const [nftData, setNFTData] = useState<any>();
    const [collection, setCollection] = useState<any>();
    const [availableUsers, setAvailableUsers] = useState<any>();
    const [tokenPrice, setTokenPrice] = useState<number>(0);
    const [totalList, setTotalList] = useState<any>();
    const [totalOffer, setTotalOffer] = useState<any>();
    const [sellListItemCount, setSellListItemCount] = useState(1);
    const [sellOfferItemCount, setSellOfferItemCount] = useState(1);
    const [isCreateListModal, setIsCreateListModal] = useState(false);
    const [isMakeOfferModal, setIsMakeOfferModal] = useState(false);

    const getMainData = async () => {
        try {
            setIsLoading(true)
            if (!details) return;
            const mainData = await fetchMainData(details);
            if (!mainData) return;
            setNFTData(mainData.matchNFTData)
            setCollection(mainData.matchCollection)
            setAvailableUsers(mainData.availableUsers)
            const tokenPrice = await fetchTokenPrice(mainData.matchNFTData)
            const latestSaleList = await fetchSaleList(mainData.matchNFTData)
            const latestOfferList = await fetchOfferList(mainData.matchNFTData)
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

    useEffect(() => {
        if (!params || !params.nft) return;
        setDetails({
            contractAddress: params.nft[1] as string,
            network: params.nft[2] as string,
            tokenID: params.nft[3] as string,
            ownerAddress: params.nft[4] as string
        })
        if (Number(params.nft[2]) !== chain?.id) {
            (async () => {
                await switchNetwork({
                    chainId: Number(params.nft[2])
                });
            })();
        }
    }, [JSON.stringify(params?.nft)])

    useEffect(() => {
        if (!isConnected) return;
        getMainData();
    }, [details, isConnected])

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
                    {(nftData && collection) && (
                        <Stack className='w-full' direction={{ xs: 'column', md: 'row' }} justifyContent={'space-between'}>
                            <Stack width={{ xs: 'full', md: '40%' }}>
                                <Title nftData={nftData} collection={collection} />
                                <Stack className="w-full aspect-square">
                                    <ModelViewer prevURL={nftData.imageURL} />
                                </Stack>
                                <Stack className="mt-2">
                                    <NFTDescription nftData={nftData} collection={collection} />
                                </Stack>
                            </Stack>
                            <Stack width={{ xs: 'full', md: '55%' }}>
                                <Title nftData={nftData} collection={collection} isShow />
                                <Stack direction='row' alignItems='center' mb={2} gap={2}>
                                    {availableUsers && (
                                        <Stack direction='row' alignItems='center' gap={0.5}>
                                            <Icon icon="ph:users-duotone" fontSize={18} />
                                            {availableUsers.length} owner
                                        </Stack>
                                    )}
                                    <Stack direction='row' alignItems='center' gap={0.5}>
                                        <Icon icon="ant-design:table-outlined" fontSize={18} />
                                        {availableUsers.map((item: any) => item.supply).reduce((acc: number, cur: number) => { return acc + cur }, 0)} items
                                    </Stack>
                                </Stack>
                                <Divider />
                                <Tabs
                                    nftData={nftData}
                                    sellListItemCount={sellListItemCount}
                                    setSellListItemCount={setSellListItemCount}
                                    sellOfferItemCount={sellOfferItemCount}
                                    setSellOfferItemCount={setSellOfferItemCount}
                                    setIsCreateListModal={setIsCreateListModal}
                                    setIsMakeOfferModal={setIsMakeOfferModal}
                                    openCreateListModal={openCreateListModal}
                                />
                                <Divider />
                                <ListingsSection
                                    totalListings={totalList}
                                    nftData={nftData}
                                    availableUsers={availableUsers}
                                    getMainData={getMainData}
                                />
                                <OffersSection
                                    totalOffers={totalOffer}
                                    nftData={nftData}
                                    availableUsers={availableUsers}
                                    getMainData={getMainData}
                                />
                                {nftData && (
                                    <CreateListModal
                                        nftData={nftData}
                                        tokenPrice={tokenPrice}
                                        sellListItemCount={sellListItemCount}
                                        setSellListItemCount={setSellListItemCount}
                                        sellOfferItemCount={sellOfferItemCount}
                                        setSellOfferItemCount={setSellOfferItemCount}
                                        setTokenPrice={setTokenPrice}
                                    />
                                )}
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            )}
        </Stack>
    )
}
