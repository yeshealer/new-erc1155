// ** React imports
import React from 'react'
import { useRouter } from "next/navigation";
import Link from 'next/link';
// ** constants && style imports
import { SupportNetworkIcons } from '@/constants/main';
import { HomeMainBtn } from './style';
// ** UI imports
import { Player } from '@lottiefiles/react-lottie-player';
import Stack from '@mui/material/Stack';

export default function MainSection() {
    const router = useRouter();

    return (
        <Stack direction='row' alignItems='center' justifyContent='center' className='px-3'>
            <Stack alignItems='center' justifyContent='space-around' className="max-w-7xl w-full" sx={{ minHeight: 'calc(100vh - 100px)' }}>
                <Stack alignItems='center' gap={5} className='w-full'>
                    <p className={`text-black text-xl md:text-2xl w-full md:w-4/5 text-center font-medium`}>Limited edition interoperable 3D avatars that can be used across a variety of different virtual worlds</p>
                    <div className='w-full flex flex-col md:flex-row items-center justify-center gap-10'>
                        <Link className='w-full lg:w-1/3 md:w-1/2' href={'/create'}>
                            <HomeMainBtn>
                                <Player
                                    autoplay
                                    loop
                                    src="/assets/lottie/collection.json"
                                    style={{ height: '300px', width: '300px', position: 'absolute', top: '50%', left: '50%', opacity: .3, transform: 'translate(-50%, -50%)' }}
                                />
                                <div className='z-10'>Collection</div>
                            </HomeMainBtn>
                        </Link>
                        <Link className='w-full lg:w-1/3 md:w-1/2' href={'/drop'}>
                            <HomeMainBtn>
                                <Player
                                    autoplay
                                    loop
                                    src="/assets/lottie/drop.json"
                                    style={{ height: '200px', width: '200px', position: 'absolute', top: '45%', left: '50%', opacity: .4, transform: 'translate(-50%, -50%)' }}
                                />
                                <div className='z-10'>NFT Drop</div>
                            </HomeMainBtn>
                        </Link>
                    </div>
                </Stack>
                <Stack alignItems='center' gap={2} className={`my-5 md:mt-20 max-w-md w-full`}>
                    <p className={`text-black font-semibold text-2xl md:text-3xl`}>Supported By</p>
                    <Stack direction='row' alignItems='center' justifyContent='center' flexWrap='wrap' className='gap-x-8'>
                        {SupportNetworkIcons.map(item => (
                            <img src={item} alt="network" width="40" height="40" draggable={false} key={item} />
                        ))}
                    </Stack>
                </Stack>
            </Stack >
        </Stack>
    )
}