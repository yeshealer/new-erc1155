import dynamic from "next/dynamic";
import useDrop from "@/hooks/useDrop";
import { Stack } from "@mui/material"
import { useEffect, useState } from "react"
import { Icon } from "@iconify/react";
import { NetworkList, exploreTabConfig } from "@/constants/main";
import { fetchBalance } from '@wagmi/core'
import { useNetwork } from "wagmi";
import { useRouter } from "next/navigation";

const ModelViewer = dynamic(() => import("@/components/widgets/ModelViewer"), { ssr: false });

export default function MainSection() {
    const [isLoading, setIsLoading] = useState(false);
    const [dropData, setDropData] = useState<any[]>();
    const [creatorData, setCreatorData] = useState<any[]>([]);

    const { getDropData } = useDrop();
    const { chain } = useNetwork();
    const router = useRouter();

    const getTotalSum = (numArray: number[]) => {
        return numArray.reduce((beforeValue, currentValue) => beforeValue + currentValue, 0)
    }

    const getLocalTime = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };
        return date.toLocaleString('en-GB', options as any);
    }

    useEffect(() => {
        setIsLoading(true);
        (async () => {
            const createrData: any[] = [];
            const dropLatestData = await getDropData(setIsLoading) as any[];

            for (const dropData of dropLatestData) {
                const balance = await fetchBalance({
                    address: dropData.royalReceiver,
                });

                const createrExists = createrData.some(item => item.creater.toLowerCase() === dropData.royalReceiver.toLowerCase());

                if (!createrExists) {
                    createrData.push({
                        creater: dropData.royalReceiver,
                        balance: balance.formatted,
                        symbol: balance.symbol,
                    });
                }
            }
            setDropData(dropLatestData)
            setCreatorData(createrData)
            setIsLoading(false);
        })();
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
                    <div className="w-full text-center text-3xl font-semibold mt-5 text-sky-500">Universal NFT Interoperability Protocol</div>
                    <div className="w-full text-center text-lg font-medium mt-2 text-gray-600">Building the framework for blockchain agnostinc NFT interoperability & composability</div>
                    <div className="mt-5">
                        <div className="badge badge-secondary badge-lg font-semibold">Trending Drops</div>
                        <div className="my-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-10">
                            {(dropData && dropData.length > 0) && dropData.sort(function (a: any, b: any) {
                                return getTotalSum(b.buyedAmount) - getTotalSum(a.buyedAmount)
                            }).slice(0, 3).map((dropDataOne: any, i: number) => (
                                <div key={i} className="card card-compact w-full bg-base-100 shadow-xl">
                                    <figure className='relative'>
                                        <ModelViewer prevURL={dropDataOne.imageURL} />
                                        <div className="badge badge-sm absolute right-2 bottom-2">{getTotalSum(dropDataOne.buyedAmount)} claimed</div>
                                    </figure>
                                    <div className="card-body">
                                        <button className="btn btn-block btn-info btn-sm text-white" onClick={() => router.push(`/drop?address=${dropDataOne.contractAddress}`)}>
                                            Show details
                                            <Icon icon="ic:twotone-info" fontSize={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-5">
                        <div className="badge badge-success text-white badge-lg font-semibold">Newest Drops</div>
                        <div className="my-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-10">
                            {(dropData && dropData.length > 0) && dropData.sort(function (a: any, b: any) {
                                return b.startTimestamp - a.startTimestamp
                            }).slice(0, 3).map((dropDataOne: any, i: number) => (
                                <div key={i} className="card card-compact w-full bg-base-100 shadow-xl">
                                    <figure className='relative'>
                                        <ModelViewer prevURL={dropDataOne.imageURL} />
                                        <div className="badge badge-sm absolute right-2 bottom-2">Synced on {getLocalTime(dropDataOne.startTimestamp as any)}</div>
                                    </figure>
                                    <div className="card-body">
                                        <button className="btn btn-block btn-info btn-sm text-white" onClick={() => router.push(`/drop?address=${dropDataOne.contractAddress}`)}>
                                            Show details
                                            <Icon icon="ic:twotone-info" fontSize={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-5">
                        <div className="badge badge-info text-white badge-lg font-semibold">All Drops</div>
                        <div className="tabs mt-2">
                            {exploreTabConfig.map(((item: string, index: number) => {
                                return (
                                    <a key={item} className={`tab tab-lifted ${index === 0 ? "tab-active" : ''}`}>{item}</a>
                                )
                            }))}
                        </div>
                        <div className="my-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-10">
                            {(dropData && dropData.length > 0) && dropData.map((dropDataOne: any, i: number) => (
                                <div key={i} className="card card-compact w-full bg-base-100 shadow-xl">
                                    <figure className='relative'>
                                        <ModelViewer prevURL={dropDataOne.imageURL} />
                                    </figure>
                                    <div className="card-body">
                                        <button className="btn btn-block btn-info btn-sm text-white" onClick={() => router.push(`/drop?address=${dropDataOne.contractAddress}`)}>
                                            Show details
                                            <Icon icon="ic:twotone-info" fontSize={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="my-5">
                        <div className="badge badge-primary text-white badge-lg font-semibold">Our Creators</div>
                        <div className="my-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-10">
                            {(creatorData && creatorData.length > 0) && creatorData.map((creater: any, i: number) => (
                                <div key={i} className="card card-compact w-full bg-base-100 shadow-xl">
                                    <figure className='relative bg-[#e0f2fe] py-2'>
                                        <div className="avatar">
                                            <div className="w-24 mask mask-hexagon">
                                                <img src={`https://web3-images-api.kibalabs.com/v1/accounts/${creater.creater}/image`} alt={creater.creater} />
                                            </div>
                                        </div>
                                    </figure>
                                    <div className="card-body flex flex-col items-center">
                                        <div className="badge cursor-pointer" onClick={() => window.open(`${NetworkList.find(item => item.id === chain?.id)?.explorer}${creater.creater}`)}>{creater.creater}</div>
                                        <div className="badge">Balance: {creater.balance.toLocaleString()} {creater.symbol}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Stack>
            )}
        </Stack>
    )
}
