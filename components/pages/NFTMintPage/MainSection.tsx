import Stack from '@mui/material/Stack'
import { IconButton } from '@/components/globalstyle';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import React, { useState } from 'react'
import '@google/model-viewer';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': MyElementAttributes;
        }
        interface MyElementAttributes {
            src: string;
            style: { width: string; height: string; background: string; borderRadius: string }
        }
    }
}

export default function MainSection() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [fileImg, setFileImg] = useState('');
    const [prevUrl, setPrevUrl] = useState<string>('');
    const [prevFileExt, setPrevFileExt] = useState('');

    const handleFileUpload = (event: any) => {
        setFileImg(event.target.files[0]);
        setPrevUrl(URL.createObjectURL(event.target.files[0]));
        setPrevFileExt(event.target.files[0].name.substring(event.target.files[0].name.length - 4, event.target.files[0].name.length));
    };

    const fileClick = () => {
        if (document) {
            document.getElementById('myInput')?.click();
        }
    }

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
                    <Stack direction='row' alignItems='center' justifyContent='center' className="w-full relative">
                        <IconButton
                            onClick={() => router.push('/create')}
                            className='absolute left-0'
                        >
                            <Icon icon="solar:undo-left-bold" fontSize={20} />
                        </IconButton>
                        <div className="text-center text-3xl sm:text-4xl font-bold">Mint NFT</div>
                    </Stack>
                    <div className='divider' />
                    <Stack>
                        <Stack gap={2}>
                            <span className="badge badge-info text-white">3D Model Interoperability</span>
                            <div className='border-2 border-dotted border-sky-500 h-60 rounded-xl p-1 flex items-center justify-center relative'>
                                {!prevUrl ? (
                                    <div>
                                        <input id="myInput" className="hidden" type="file" accept="*" onChange={handleFileUpload} required />
                                        <div className="cursor-pointer flex flex-col items-center justify-center font-semibold text-sky-500" onClick={fileClick}>
                                            <Icon icon="humbleicons:upload" color="#2196f3" fontSize={30} />
                                            Click to Upload
                                        </div>
                                    </div>
                                ) : (
                                    <div className='w-full h-full'>
                                        <Icon icon="ion:close" className='absolute right-4 top-4 z-10 cursor-pointer' fontSize={20} onClick={() => {
                                            setPrevUrl('')
                                            setFileImg('')
                                        }} />
                                        <model-viewer style={{ width: '100%', height: '100%', background: '#e0f2fe', borderRadius: '12px' }} src={prevUrl} camera-controls="true" touch-action="pan-y" ar-status="not-presenting" />
                                    </div>
                                )
                                }
                            </div>
                        </Stack>
                    </Stack>
                </Stack>
            )}
        </Stack>
    )
}
