import Stack from '@mui/material/Stack'
import { Button, IconButton } from '@/components/globalstyle';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import React, { useEffect, useState } from 'react'
import { useSnackbar } from 'notistack';
import { metaDataOptions } from '@/constants/main';
import { metaDataTypes } from '@/constants/type';
import { infoVariant } from '@/utils/stickyHelper';
import useIPFS from '@/hooks/useIPFS';
import useCollection from '@/hooks/useCollection';
import useNFT from '@/hooks/useNFT';
import ModelViewer from '@/components/widgets/ModelViewer';

export default function MainSection() {
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const { sendFileToIPFS, sendJSONtoIPFS } = useIPFS();
    const { getCollectionData } = useCollection();
    const { mint } = useNFT();
    const pathname = usePathname();

    const [isUploading, setIsUploading] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [fileImg, setFileImg] = useState('');
    const [prevUrl, setPrevUrl] = useState<string>('');
    const [nftSupply, setNftSupply] = useState(0);
    const [nftName, setNftName] = useState('');
    const [nftDescription, setNftDescription] = useState('');
    const [selectedMetaDatas, setSelectedMetaDatas] = useState<metaDataTypes[]>([]);
    const [metaDataLabel, setMetaDataLabel] = useState('');
    const [collectionData, setCollectionData] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);

    const pathName = pathname.slice(5, pathname.length - 5);

    const handleFileUpload = (event: any) => {
        setFileImg(event.target.files[0]);
        setPrevUrl(URL.createObjectURL(event.target.files[0]));
    };

    const fileClick = () => {
        if (document) {
            document.getElementById('myInput')?.click();
        }
    }

    const handleSelectMetaData = (value: string) => {
        if (!selectedMetaDatas) return;
        const updatedMetadata = selectedMetaDatas.map(item => {
            if (item.value === value) {
                item.checked = !item.checked
            }
            return item
        })
        const labelText = updatedMetadata.filter(item => item.checked).map(item => { return item.label }).join(', ');
        setMetaDataLabel(labelText)
        setSelectedMetaDatas(updatedMetadata)
    }

    const handleMint = async () => {
        try {
            if (fileImg === '') {
                enqueueSnackbar('Please upload 3D character.', { variant: infoVariant })
                return;
            } else if (nftSupply <= 0 || nftName === '' || nftDescription === '' || metaDataLabel === '') {
                enqueueSnackbar('Please fill out empty boxes.', { variant: infoVariant })
                return;
            } else if (!collectionData) {
                enqueueSnackbar('Collection data load failed!', { variant: infoVariant })
                return;
            }
            setIsUploading(true)
            const imageHash = await sendFileToIPFS(fileImg);
            if (!imageHash) {
                setIsUploading(false)
                return;
            }
            const tokenURI = await sendJSONtoIPFS(imageHash, nftName, nftDescription, selectedMetaDatas);
            if (!tokenURI) {
                setIsUploading(false)
                return;
            }
            setIsUploading(false);
            setIsMinting(true);
            await mint(collectionData, tokenURI, nftSupply, nftName, nftDescription);
            setMetaDataLabel('');
            setIsMinting(false);
        } catch (err) {
            console.log(err)
            setIsUploading(false)
            setIsMinting(false)
        }
    }

    useEffect(() => {
        if (metaDataOptions) {
            setSelectedMetaDatas(metaDataOptions)
        }
    }, [metaDataOptions])

    useEffect(() => {
        (async () => {
            setIsLoading(true)
            const collection = await getCollectionData(pathName);
            setCollectionData(collection)
            setIsLoading(false)
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
            ) : isUploading ? (
                <Stack
                    justifyContent='center'
                    alignItems='center'
                    sx={{ minHeight: 'calc(100vh - 100px)' }}
                >
                    <span className="loading loading-infinity w-32 text-info"></span>
                    <div className='text-sky-500 font-bold text-2xl'>Uploading...</div>
                </Stack>
            ) : isMinting ? (
                <Stack
                    justifyContent='center'
                    alignItems='center'
                    sx={{ minHeight: 'calc(100vh - 100px)' }}
                >
                    <span className="loading loading-infinity w-32 text-success"></span>
                    <div className='text-green-500 font-bold text-2xl'>Minting...</div>
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
                    <Stack gap={2}>
                        <Stack gap={1}>
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
                                        <Icon icon="ion:close" className='absolute right-4 top-4 z-10 cursor-pointer bg-sky-400 hover:bg-sky-300 rounded-full text-white p-1 w-6 h-6 transition-all' fontSize={20} onClick={() => {
                                            setPrevUrl('')
                                            setFileImg('')
                                        }} />
                                        <ModelViewer prevURL={prevUrl} />
                                    </div>
                                )}
                            </div>
                        </Stack>
                        <Stack direction={{ sm: 'column', md: 'row' }} gap={2}>
                            <Stack gap={1} width='100%'>
                                <span className="badge badge-info text-white">Supply</span>
                                <input
                                    type="number"
                                    placeholder="Enter Supply"
                                    className="input input-bordered input-info w-full"
                                    value={nftSupply ? nftSupply : ''}
                                    onChange={(e) => { setNftSupply(Number(e.target.value)) }}
                                />
                            </Stack>
                            <Stack gap={1} width='100%'>
                                <span className="badge badge-info text-white">Name</span>
                                <input
                                    type="text"
                                    placeholder="Enter Name"
                                    className="input input-bordered input-info w-full"
                                    value={nftName ? nftName : ''}
                                    onChange={(e) => { setNftName(e.target.value) }}
                                />
                            </Stack>
                        </Stack>
                        <Stack direction={{ sm: 'column', md: 'row' }} gap={2}>
                            <Stack gap={1} width='100%'>
                                <span className="badge badge-info text-white">Description</span>
                                <input
                                    type="text"
                                    placeholder="Enter Description"
                                    className="input input-bordered input-info w-full"
                                    value={nftDescription ? nftDescription : ''}
                                    onChange={(e) => { setNftDescription(e.target.value) }}
                                />
                            </Stack>
                            <Stack gap={1} width='100%'>
                                <span className="badge badge-info text-white">Add Metadata</span>
                                <div className="dropdown">
                                    <input tabIndex={0} className="input input-bordered input-info w-full cursor-pointer" placeholder='Select metadatas' value={metaDataLabel} spellCheck={false} />
                                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full max-h-40 overflow-y-auto flex flex-col mt-2">
                                        {metaDataOptions.map(item => (
                                            <li key={item.value} onClick={() => (handleSelectMetaData(item.value))}>
                                                <a>
                                                    <input type="checkbox" className="checkbox checkbox-info checkbox-sm" checked={item.checked} />
                                                    {item.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Stack>
                        </Stack>
                        <Button className="w-full my-5 justify-center" onClick={() => handleMint()}>Mint</Button>
                    </Stack>
                </Stack>
            )}
        </Stack>
    )
}
