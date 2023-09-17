import React, { useEffect, useState } from 'react'
import { Stack } from '@mui/material'
import { IconButton } from '@/components/globalstyle';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { NetworkList } from '@/constants/main';
import { switchNetwork } from '@wagmi/core'
import { useSnackbar } from 'notistack';
import { errorVariant } from '@/utils/stickyHelper';
import useDrop from '@/hooks/useDrop';

const filterData = ['All', 'Listings', 'Offers'].map(
    item => ({ label: item, value: item })
);

export default function MainSection() {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { getSalesData, getOfferData } = useDrop();

    const [isLoading, setIsLoading] = useState(false);
    const [typeFilter, setTypeFilter] = useState(filterData[0].value);
    const [searchFilter, setSearchFilter] = useState({
        network: 0
    });
    const [saleData, setSaleData] = useState([]);
    const [offerData, setOfferData] = useState([]);

    const handleChangeType = (value: string) => {
        setTypeFilter(value)
    }

    const handleChangeSearchFilter = async (value: string, type: string) => {
        if (type === 'network') {
            setSearchFilter({ ...searchFilter, network: Number(value) })
            try {
                await switchNetwork({
                    chainId: Number(value)
                })
            } catch (err) {
                console.log(err)
                enqueueSnackbar('Failed to switch network', { variant: errorVariant })
            }
        }
    }

    const getInitialData = async () => {
        const saleData = await getSalesData();
        const offerData = await getOfferData();
    }

    useEffect(() => {
        getInitialData();
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
                    <Stack direction='row' justifyContent='flex-end' alignItems='center'>
                        <IconButton
                            onClick={() => router.push('/drop')}
                            className="absolute left-0"
                        >
                            <Icon icon="solar:undo-left-bold" fontSize={20} />
                        </IconButton>
                        <div className='flex flex-col sm:flex-row items-center gap-2'>
                            <select className="select select-info select-sm w-full max-w-[160px]" onChange={(event) => handleChangeType(event.target.value)}>
                                {filterData.map(item => {
                                    return (
                                        <option key={item.value} value={item.value}>{item.label}</option>
                                    )
                                })}
                            </select>
                            <select className="select select-info select-sm w-full max-w-[160px]" onChange={(event) => handleChangeSearchFilter(event.target.value, 'network')}>
                                {NetworkList.map(item => {
                                    return (
                                        <option key={item.network} value={item.id}>
                                            <div className='flex items-center gap-2'>
                                                <img src={item.image} alt='chain logo' width={22} height={22} />
                                                {item.network}
                                            </div>
                                        </option>
                                    )
                                })}
                            </select>
                        </div>
                    </Stack>
                    <div className='divider' />
                </Stack>
            )}
        </Stack>
    )
}
