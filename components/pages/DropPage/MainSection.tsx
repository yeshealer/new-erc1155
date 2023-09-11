import React, { useEffect, useState } from 'react'
import { IconButton, Button } from "@/components/globalstyle";
import { Stack } from '@mui/material'
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import useDrop from '@/hooks/useDrop';
import { Element, animateScroll } from "react-scroll";
import ModelViewer from '@/components/widgets/ModelViewer';
import { NetworkList } from '@/constants/main';
import useNetwork from '@/hooks/useNetwork';
import { useAccount, useNetwork as useNetworkInfo } from 'wagmi';

const defaultDeployDropInfo = {
    newNetwork: '',
    newTitle: '',
    newDesc: '',
    newsymbol: '',
    newsupply: 0,
    newTokenURI: '',
    newPrice: 0,
    newDuration: 0,
    newRoyalFee: 0,
    newDropID: '',
    network: [] as string[],
    maxEditions: [] as number[],
    startTimestamp: 0,
    endTimestamp: 0,
    newDropId: [] as string[],
    contractAddress: ''
}

const durationUnitList = ['days', 'hours', 'min', 'sec']

export default function MainSection() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getDropData, claim } = useDrop();
    const {
        getNetworkIndex,
        changeNetwork
    } = useNetwork();
    const { address } = useAccount();
    const { chain } = useNetworkInfo();

    const [isLoading, setIsLoading] = useState(false);
    const [dropData, setDropData] = useState<any>();
    const [selectedDrop, setSelectedDrop] = useState('');
    const [ownerIcon, setOwnerIcon] = useState<string[]>([]);
    const [newDeployDropInfo, setNewDeployDropInfo] = useState(defaultDeployDropInfo);
    const [fullDesc, setFullDesc] = useState<boolean[]>([]);
    const [dayCounter, setDayCounter] = useState<number[]>([]);
    const [hoursCounter, setHoursCounter] = useState<number[]>([]);
    const [minutesCounter, setMinutesCounter] = useState<number[]>([]);
    const [secondsCounter, setSecondsCounter] = useState<number[]>([]);
    const [buyAmountList, setBuyAmountList] = useState<number[]>([]);
    const [isClaiming, setIsClaiming] = useState(false);

    const handleCopyAddress = (address: string, index: number) => {
        navigator.clipboard.writeText(address)
        const defaultIcons = ownerIcon
        setOwnerIcon([...ownerIcon.slice(0, index), 'ic:round-check', ...ownerIcon.slice(-index)])
        setTimeout(() => {
            setOwnerIcon(defaultIcons)
        }, 1500)
    }

    const handleClickAddNetworkModal = async (networkId: number, title: string, description: string, symbol: string, maxEdition: number[], tokenURI: string, price: number, duration: number, royalFee: number, id: string, network: string[], startTimestamp: number, endTimestamp: number, dropId: string[], contractAddress: string) => {
        if (chain?.id !== networkId) {
            changeNetwork(networkId)
        }
        const newNetwork = NetworkList.find(item => item.id === networkId)?.network || ''
        const supply = Math.max.apply(null, maxEdition);
        setNewDeployDropInfo({
            ...newDeployDropInfo,
            newNetwork: newNetwork,
            newTitle: title,
            newDesc: description,
            newsymbol: symbol,
            newsupply: supply,
            newTokenURI: tokenURI.toString(),
            newPrice: price,
            newDuration: duration,
            newRoyalFee: royalFee,
            newDropID: id,
            network: network,
            maxEditions: maxEdition,
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp,
            newDropId: dropId,
            contractAddress: contractAddress
        })
    }

    const handleMinus = (index: number) => {
        if (buyAmountList[index] > 0) {
            setBuyAmountList(prevState => [...prevState.slice(0, index), Number(buyAmountList[index]) - 1, ...prevState.slice(index + 1)]);
        }
    };

    const handlePlus = (index: number) => {
        setBuyAmountList(prevState => [...prevState.slice(0, index), Number(buyAmountList[index]) + 1, ...prevState.slice(index + 1)]);
    };

    const handleClaim = async (contractAddress: `0x${string}`, buyAmount: number, buyedAmount: number[], pricePerToken: number, id: string) => {
        setIsClaiming(true);
        await claim(contractAddress, buyAmount, buyedAmount, pricePerToken, id);
        setIsClaiming(false);
    }

    const getInitialData = async () => {
        setIsLoading(true)
        const dropInfo = await getDropData();
        if (!dropInfo) return;
        setDropData(dropInfo)
        dropInfo.map(item => {
            setOwnerIcon(Array.from({ length: dropInfo.length }, () => 'solar:copy-outline'))
            setFullDesc(Array.from({ length: dropInfo.length }, () => true))
            setBuyAmountList(Array.from({ length: dropInfo.length }, () => 1))
        })
        setIsLoading(false);
    }

    useEffect(() => {
        getInitialData();
    }, [])

    useEffect(() => {
        setSelectedDrop(searchParams.get('address') || '')
    }, [searchParams])

    useEffect(() => {
        if (selectedDrop && !isLoading) {
            const selectedElement = document.getElementById(selectedDrop)
            animateScroll.scrollTo(selectedElement?.scrollHeight || 0 - 770)
        }
    }, [selectedDrop, isLoading])

    useEffect(() => {
        if (!dropData) return;
        const counterTime = dropData.map((item: any) => {
            const remainTime = (Number(item.endTimestamp) * 1000 - Date.now()) / 1000;
            const days = Math.floor(remainTime / 3600 / 24);
            const hours = Math.floor(remainTime / 3600) % 24;
            const minutes = Math.floor((remainTime % 3600) / 60);
            const seconds = Math.floor(remainTime % 60);
            if (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0) {
                return { days: Number.NEGATIVE_INFINITY, hours: Number.NEGATIVE_INFINITY, minutes: Number.NEGATIVE_INFINITY, seconds: Number.NEGATIVE_INFINITY }
            }
            return { days, hours, minutes, seconds: 59 }
        })
        setDayCounter(counterTime.map((item: any) => item.days));
        setHoursCounter(counterTime.map((item: any) => item.hours));
        setMinutesCounter(counterTime.map((item: any) => item.minutes));
        setSecondsCounter(counterTime.map((item: any) => item.seconds));
    }, [dropData])

    useEffect(() => {
        const intervals: any[] = [];

        const updateCounter = (counter: number[], interval: any, defaultValue: number) => {
            if (Array.isArray(counter) && counter.length > 0) {
                const updatedValue = counter.map((num) => {
                    if (num === Number.NEGATIVE_INFINITY) {
                        return Number.NEGATIVE_INFINITY;
                    } else if (num > 0) {
                        return num - 1
                    } else {
                        return defaultValue
                    }
                });
                return updatedValue;
            }
            return [];
        };

        intervals.push(setInterval(() => {
            setDayCounter((value) => updateCounter(value, intervals[0], 0));
        }, 86400000));

        intervals.push(setInterval(() => {
            setHoursCounter((value) => updateCounter(value, intervals[1], 23));
        }, 3600000));

        intervals.push(setInterval(() => {
            setMinutesCounter((value) => updateCounter(value, intervals[2], 59));
        }, 60000));

        intervals.push(setInterval(() => {
            setSecondsCounter((value) => updateCounter(value, intervals[3], 59));
        }, 1000));

        return () => {
            intervals.forEach((interval) => clearInterval(interval));
        };
    }, []);

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
            ) : isClaiming ? (
                <Stack
                    justifyContent='center'
                    alignItems='center'
                    sx={{ minHeight: 'calc(100vh - 100px)' }}
                >
                    <span className="loading loading-infinity w-32 text-info"></span>
                    <div className='text-sky-500 font-bold text-2xl'>Claiming...</div>
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
                        <div className='flex flex-col sm:flex-row gap-2 items-end'>
                            <Button onClick={() => router.push('/drop/marketplace')} className='bg-lime-500 hover:bg-lime-400'>
                                <Icon icon="mdi:marketplace" fontSize={20} />
                                Marketplace
                            </Button>
                            <Button onClick={() => router.push('/drop/create')}>
                                <Icon icon="material-symbols:add-location-rounded" fontSize={20} />
                                Create Drop
                            </Button>
                        </div>
                    </Stack>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 my-4 gap-4'>
                        {(dropData && dropData.length > 0) && dropData.map((item: any, index: number) => {
                            const daysStyle: any = { '--value': dayCounter[index] };
                            const hoursStyle: any = { '--value': hoursCounter[index] };
                            const minutesStyle: any = { '--value': minutesCounter[index] };
                            const secondsStyle: any = { '--value': secondsCounter[index] };
                            const isEnded = dayCounter[index] <= 0 && hoursCounter[index] <= 0 && minutesCounter[index] < 0
                            return (
                                <Element name={item.contractAddress} id={item.contractAddress} key={item.id}>
                                    <div className="card card-compact bg-base-100 shadow-xl shadow-sky-500/20 border border-sky-500/50">
                                        <figure className='relative'>
                                            <ModelViewer prevURL={item.imageURL} />
                                        </figure>
                                        <div className="card-body p-1">
                                            <div className=''>
                                                <div className='badge badge-outline badge-info badge-sm'>
                                                    <Icon icon="ph:user-bold" className='mr-1' />
                                                    Created by
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <div className='overflow-hidden text-ellipsis'>{item.royalReceiver}</div>
                                                    <Icon icon={ownerIcon[index]} fontSize={18} className="w-4 cursor-pointer" onClick={() => handleCopyAddress(item.royalReceiver, index)} />
                                                </div>
                                            </div>
                                            <div className=''>
                                                <div className='badge badge-outline badge-info badge-sm'>
                                                    <Icon icon="fluent:presence-available-10-regular" className='mr-1' />
                                                    Available on
                                                </div>
                                                <div className='flex flex-wrap items-center gap-5'>
                                                    {NetworkList.map(network => {
                                                        return (
                                                            <div className='flex items-center gap-2 h-10' key={network.id}>
                                                                <img src={network.image} className={item.network.includes(network.network) ? '' : 'item-gray'} width={25} height={25} draggable={false} alt="network" />
                                                                <div className={`fs-14 t-normal t-greyWhite ${item.network.includes(network.network) ? '' : 'item-gray'}`}>{item.buyedAmount[getNetworkIndex(network.id)]} / {item.maxEditions[getNetworkIndex(network.id)]}</div>
                                                                {(!item.network.includes(network.network) && item.royalReceiver === address) && (
                                                                    <button
                                                                        onClick={() => handleClickAddNetworkModal(
                                                                            network.id,
                                                                            item.title,
                                                                            item.description,
                                                                            item.symbol,
                                                                            item.maxEditions,
                                                                            item.baseURI,
                                                                            item.pricePerToken,
                                                                            item.duration,
                                                                            item.royalFee,
                                                                            item.id,
                                                                            item.network,
                                                                            item.startTimestamp,
                                                                            item.endTimestamp,
                                                                            item.dropId,
                                                                            item.contractAddress
                                                                        )}
                                                                        className='rounded-full bg-sky-500 hover:bg-sky-400 text-white p-1'
                                                                    >
                                                                        <Icon icon="ic:round-plus" fontSize={20} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            <div className=''>
                                                <div className='badge badge-outline badge-info badge-sm'>
                                                    <Icon icon="tabler:file-description" className='mr-1' />
                                                    Description
                                                </div>
                                                <div className='min-h-[100px]'>
                                                    {(item.description.length > 230 && fullDesc[index]) ? item.description.slice(0, 230) + '...' : item.description}
                                                    {item.description.length > 230 && <span className="ml-1 text-sky-500 cursor-pointer" onClick={() => setFullDesc(prevState => [...prevState.slice(0, index), !prevState[index], ...prevState.slice(dropData.length - index)])}>{fullDesc[index] ? 'See more' : 'See less'}</span>}
                                                </div>
                                            </div>
                                            <div className=''>
                                                <div className='badge badge-outline badge-info badge-sm'>
                                                    <Icon icon="ph:link" className='mr-1' />
                                                    Contract Address
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <div className='overflow-hidden text-ellipsis'>{item.contractAddress}</div>
                                                    <Icon icon="ph:link" fontSize={18} className="w-4 cursor-pointer" onClick={() => { window.open(NetworkList.find(item => item.id === chain?.id)?.explorer + item.contractAddress) }} />
                                                </div>
                                            </div>
                                            <div className=''>
                                                <div className='badge badge-outline badge-info badge-sm'>
                                                    <Icon icon="fluent:apps-list-detail-24-regular" className='mr-1' />
                                                    Details
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <div className='badge badge-primary text-white badge-sm'>ERC-1155</div>
                                                    <div className='badge badge-warning text-white badge-sm'>{item.royalFee}% Fee</div>
                                                    {NetworkList.map(item => item.id).includes(chain?.id as number) && <div className='badge badge-success text-white badge-sm'>{item.pricePerToken === 0 ? 'Free' : `${item.pricePerToken} ${NetworkList.find(item => item.id === chain?.id)?.currency}`}</div>}
                                                </div>
                                            </div>
                                            <div className=''>
                                                <div className='badge badge-outline badge-info badge-sm'>
                                                    <Icon icon="icon-park-outline:time" className='mr-1' />
                                                    Ends in
                                                </div>
                                                <div className="flex flex-wrap gap-5">
                                                    {isEnded ? (
                                                        <div className='badge badge-error text-white mt-1.5'>This drop has been ended.</div>
                                                    ) : (
                                                        [daysStyle, hoursStyle, minutesStyle, secondsStyle].map((item, index) => {
                                                            return (
                                                                <div className='text-gray-500' key={item}>
                                                                    <span className="countdown text-2xl text-sky-500 mr-1">
                                                                        <span style={item}></span>
                                                                    </span>
                                                                    {durationUnitList[index]}
                                                                </div>
                                                            )
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                            <div className=''>
                                                <div className='badge badge-outline badge-info badge-sm'>
                                                    <Icon icon="ph:users-duotone" className='mr-1' />
                                                    Collected by
                                                </div>
                                                <div className="avatar-group -space-x-6">
                                                    {item.collecters.filter((user: string, i: number) => i < 4).map((user: string) => {
                                                        return (
                                                            <div className="avatar" key={user}>
                                                                <div className="w-12">
                                                                    <img src={user} />
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                    {item.collecters.length > 4 && (
                                                        <div className="avatar placeholder">
                                                            <div className="w-12 bg-neutral-focus text-neutral-content">
                                                                <span>+99</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {item.collecters.length === 0 && (
                                                        <div className='badge badge-error text-white my-[18px]'>There is no collecters for now.</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className='divider my-0' />
                                            <div className='flex items-center gap-2'>
                                                <label className="input-group w-full">
                                                    <button className="btn btn-sm btn-info text-white" onClick={() => handleMinus(index)}><Icon icon="ic:round-minus" /></button>
                                                    <input
                                                        type="number"
                                                        placeholder="10"
                                                        className="input input-bordered input-info input-ghost input-sm max-w-[100px]"
                                                        value={buyAmountList[index]}
                                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                            const value = event.target.valueAsNumber;
                                                            if (
                                                                value <=
                                                                item.maxEditions[getNetworkIndex(chain?.id as number)] - item.buyedAmount[getNetworkIndex(chain?.id as number)]
                                                            ) {
                                                                setBuyAmountList((prevState) => [
                                                                    ...prevState.slice(0, index),
                                                                    value,
                                                                    ...prevState.slice(index + 1),
                                                                ]);
                                                            }
                                                        }}
                                                    />
                                                    <button className="btn btn-sm btn-info text-white" onClick={() => handlePlus(index)}><Icon icon="ic:round-plus" /></button>
                                                </label>
                                                <button
                                                    className="btn btn-info btn-sm text-white"
                                                    disabled={
                                                        isEnded ||
                                                        (item.buyedAmount[getNetworkIndex(chain?.id as number)] + Number(buyAmountList[index])) >
                                                        item.maxEditions[getNetworkIndex(chain?.id as number)] ||
                                                        buyAmountList[index] === 0
                                                    }
                                                    onClick={() => {
                                                        if (!isEnded && buyAmountList[index] > 0) {
                                                            handleClaim(
                                                                item.contractAddress,
                                                                buyAmountList[index],
                                                                item.buyedAmount,
                                                                item.pricePerToken,
                                                                item.id
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {isEnded
                                                        ? 'Ended Drop'
                                                        : !item.network.includes(
                                                            NetworkList.find((item) => item.id === chain?.id)?.network || ''
                                                        )
                                                            ? 'Deploy Drop'
                                                            : (Number(item.buyedAmount[getNetworkIndex(chain?.id as number)]) +
                                                                Number(buyAmountList[index])) >
                                                                Number(item.maxEditions[getNetworkIndex(chain?.id as number)])
                                                                ? 'Rate Limited'
                                                                : 'Claim'
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Element>
                            )
                        })}
                    </div>
                </Stack>
            )}
        </Stack>
    )
}
