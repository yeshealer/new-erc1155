// ** react && next imports
import Link from 'next/link'
import { useRouter, usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
// ** UI Library imports
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Icon } from '@iconify/react'
// ** web3 imports
import { useAccount } from "wagmi";
import { Web3Button } from '@web3modal/react'
// ** components imports
import { HeaderLink } from '@/constants/main'
import { IconButton } from '@/components/globalstyle';
import { useTheme } from '@mui/material';

function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const linkName = pathname.slice(1, pathname.length);
    const { address, isConnected } = useAccount();
    const isSM = useMediaQuery('(min-width: 500px)');
    const isTablet = useMediaQuery('(max-width: 768px)');

    const [selectedTab, setSelectedTab] = useState<number>(1);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);

    const handleSelectTab = (value: number) => {
        setSelectedTab(value);
    }

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }
        setOpenDrawer(open)
    }

    useEffect(() => {
        if (linkName.startsWith('nft/') || linkName.startsWith('deploy/') || pathname === '/' || linkName === 'collection' || linkName === 'create') {
            setSelectedTab(1)
        } else if (linkName === 'bridge') {
            setSelectedTab(2)
        } else if (linkName === 'explore') {
            setSelectedTab(3)
        } else if (linkName === 'drop' || linkName === 'drop/create') {
            setSelectedTab(4)
        } else {
            setSelectedTab(0)
        }
    }, [pathname])

    useEffect(() => {
        if (isConnected !== undefined) {
            setWalletConnected(isConnected)
        }
    }, [isConnected])

    return (
        <Stack justifyContent='center' alignItems='center' className='py-5 px-3'>
            <Stack justifyContent='space-between' alignItems='center' direction='row' className='w-full max-w-7xl'>
                <Stack direction='row' alignItems='center' gap={2}>
                    <IconButton className='block md:hidden' onClick={() => setOpenDrawer(true)}><Icon icon="ri:menu-3-line" fontSize={20} /></IconButton>
                    <Link href="/" className="flex items-center" onClick={() => setSelectedTab(1)}>
                        <img className="logo-img" src="/assets/images/feta.png" alt="logo" width="40" height="40" />
                    </Link>
                </Stack>
                <Stack direction='row' alignItems='center' gap={6}>
                    {!isTablet && <Stack alignItems='center' direction='row' gap={6}>
                        {HeaderLink.map((item, index) => (
                            <Link key={item.link} href={`/${item.link}`} className={selectedTab === (index + 1) ? `font-semibold text-sky-500 text-lg header-activate` : `font-medium text-gray-950/80`} onClick={() => handleSelectTab(index + 1)}>{item.title}</Link>
                        ))}
                    </Stack>}
                    <Stack alignItems='center' direction='row' gap={2}>
                        {walletConnected && <IconButton onClick={() => router.push(`/${address}`)}><Icon icon="ph:user-duotone" fontSize={20} /></IconButton>}
                        <Web3Button balance={isSM ? 'show' : 'hide'} />
                    </Stack>
                </Stack>
            </Stack>

            <Drawer
                anchor={'left'}
                open={openDrawer}
                onClose={toggleDrawer(false)}
            >
                <Stack alignItems='start' gap={3} p={4} className="min-w-[300px] w-screen sm:w-full">
                    <IconButton className='self-end' onClick={() => setOpenDrawer(false)}><Icon icon="ic:round-close" fontSize={20} /></IconButton>
                    <Link href="/" className="mb-4">
                        <img className="logo-img" src="/assets/images/feta.png" alt="logo" width="40" height="40" />
                    </Link>
                    <Link href="/" className={selectedTab == 1 ? `font-bold text-2xl header-activate` : `font-bold text-lg text-gray-950/80`} onClick={() => {
                        handleSelectTab(1)
                        setOpenDrawer(false)
                    }}>Create</Link>
                    <Link href="/bridge" className={selectedTab == 2 ? `font-bold text-2xl header-activate` : `font-bold text-lg text-gray-950/80`} onClick={() => {
                        handleSelectTab(2)
                        setOpenDrawer(false)
                    }}>Bridge</Link>
                    <Link href="/explore" className={selectedTab == 3 ? `font-bold text-2xl header-activate` : `font-bold text-lg text-gray-950/80`} onClick={() => {
                        handleSelectTab(3)
                        setOpenDrawer(false)
                    }}>Explore</Link>
                </Stack>
            </Drawer >

        </Stack>
    );
}

export default Header;