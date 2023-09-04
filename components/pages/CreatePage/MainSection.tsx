// ** react & next imports
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// ** UI imports
import { Icon } from "@iconify/react";
import { Button } from "@/components/globalstyle";
import Stack from "@mui/material/Stack";
// ** constants & style imports
import { NetworkList } from "@/constants/main";
import { IconButton } from "@/components/globalstyle";
import BasicCard from "@/components/widgets/BasicCard";
// ** utils imports
import { getCollectionDB } from "@/utils/polybaseHelper";
// ** web3 imports
import { useAccount } from "wagmi";

export default function MainSection() {
    const router = useRouter();
    const CollectionDB = getCollectionDB();
    const { address, isConnected } = useAccount();

    const [isLoading, setIsLoading] = useState(true);
    const [collectionData, setCollectionData] = useState<any>();

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const collectionReference = CollectionDB.collection("CollectionData");
                const data = await collectionReference.get() as any;
                setCollectionData(data);
                setIsLoading(false);
            } catch (err) {
                console.log(err)
                setIsLoading(false)
            }
        })()
    }, [])

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
                    <Stack direction='row' justifyContent='flex-end'>
                        <IconButton
                            onClick={() => router.push('/')}
                            className="absolute left-0"
                        >
                            <Icon icon="solar:undo-left-bold" fontSize={20} />
                        </IconButton>
                        <Button onClick={() => router.push('/collection')}>
                            <Icon icon="material-symbols:add-location-rounded" fontSize={20} />
                            Create Collection
                        </Button>
                    </Stack >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full justify-center py-3">
                        {isConnected && collectionData && collectionData.data.map((item: any) => {
                            if (item.data.isPublic || item.data.wallet === address) {
                                const deployedNetworksList = item.data.deployedNetwork;
                                const networkImgList = deployedNetworksList.map((item: number) => NetworkList.find(network => network.id === item)?.image)
                                return (
                                    <BasicCard
                                        symbol={item.data.symbol}
                                        title={item.data.collectionName}
                                        imageList={networkImgList}
                                        collectionID={item.data.id}
                                        key={item.data.id}
                                    />
                                )
                            }
                        })}
                    </div>
                </Stack >
            )}
        </Stack>
    );
}