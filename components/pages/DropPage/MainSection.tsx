import React, { useEffect, useState } from 'react'
import { IconButton, Button } from "@/components/globalstyle";
import { Stack } from '@mui/material'
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import useDrop from '@/hooks/useDrop';

export default function MainSection() {
    const router = useRouter();
    const { getDropData } = useDrop();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            await getDropData();
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
                </Stack>
            )}
        </Stack>
    )
}
