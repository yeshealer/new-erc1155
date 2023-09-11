import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { IconButton, Button } from '@/components/globalstyle';
import { Icon } from '@iconify/react';
import { CheckboxProps, Stack } from '@mui/material';
import ModelViewer from '@/components/widgets/ModelViewer';
import { currencyData, dateData, metaDataOptions } from '@/constants/main';
import { DropDetailTypes, DurationUnit, metaDataTypes } from '@/constants/type';
import { useNetwork } from 'wagmi';
import { useSnackbar } from 'notistack';
import { infoVariant, successVariant, errorVariant } from '@/utils/stickyHelper';
import useIPFS from '@/hooks/useIPFS';
import useDrop from '@/hooks/useDrop';

const defaultDropDetail = {
    title: '',
    symbol: '',
    description: '',
    supply: 100,
    royalty: 10,
    duration: 10,
    durationUnit: DurationUnit.min,
    metadatas: []
}

export default function MainSection() {
    const router = useRouter();
    const { chain } = useNetwork();
    const { enqueueSnackbar } = useSnackbar();
    const { sendFileToIPFS, sendJSONtoIPFS } = useIPFS();
    const { createDrop } = useDrop();

    const [isLoading, setIsLoading] = useState(false);
    const [prevUrl, setPrevUrl] = useState<string>('');
    const [fileImg, setFileImg] = useState('');
    const [dropDetail, setDropDetail] = useState<DropDetailTypes>(defaultDropDetail);
    const [price, setPrice] = useState(0);
    const [metaDataLabel, setMetaDataLabel] = useState('');
    const [selectedMetaDatas, setSelectedMetaDatas] = useState<metaDataTypes[]>([]);
    const [isFree, setIsFree] = useState(true);
    const [currency, setCurrency] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isMinting, setIsMinting] = useState(false);

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

    const handleCreateDrop = async () => {
        try {
            if (fileImg === '') {
                enqueueSnackbar('Please upload 3D character.', { variant: infoVariant })
                return;
            } else if (dropDetail.title === '' || dropDetail.description === '' || dropDetail.supply < 50 || dropDetail.supply > 1000 || dropDetail.royalty < 0 || dropDetail.royalty > 100) {
                enqueueSnackbar('Please set the details correctly.', { variant: infoVariant })
                return;
            }
            setIsUploading(true)
            const imageHash = await sendFileToIPFS(fileImg);
            if (!imageHash) {
                setIsUploading(false)
                return;
            }
            const tokenURI = await sendJSONtoIPFS(imageHash, dropDetail.title, dropDetail.description, selectedMetaDatas);
            if (!tokenURI) {
                setIsUploading(false)
                return;
            }
            setIsUploading(false);
            setIsMinting(true);
            const duration = dropDetail.duration * (dateData.find(({ value }) => value === dropDetail.durationUnit)?.time || 0);
            await createDrop(dropDetail, tokenURI, price, duration)
            setIsMinting(false);
        } catch (err) {
            console.log(err)
            setIsUploading(false)
            setIsMinting(false)
        }
    }

    useEffect(() => {
        if (chain?.id) {
            setCurrency(currencyData.find(item => item.chainId === chain?.id)?.currency[0].value || '')
        }
    }, [chain?.id])

    useEffect(() => {
        if (metaDataOptions) {
            setSelectedMetaDatas(metaDataOptions)
        }
    }, [metaDataOptions])

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
                    <div className="w-full flex items-center justify-between">
                        <IconButton
                            onClick={() => router.push('/drop')}
                            className="absolute left-0"
                        >
                            <Icon icon="solar:undo-left-bold" fontSize={20} />
                        </IconButton>
                        <p className={`text-center text-3xl sm:text-4xl font-bold w-full`}>Create Drop</p>
                    </div>
                    <div className="divider" />
                    <Stack gap={2}>
                        <Stack gap={1}>
                            <span className="badge badge-info text-white">3D Model Interoperability *</span>
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
                            <Stack direction='column' gap={2} width='100%'>
                                <Stack gap={1}>
                                    <span className="badge badge-info text-white">Title *</span>
                                    <input
                                        type="text"
                                        placeholder="Enter Title"
                                        className="input input-bordered input-info w-full"
                                        value={dropDetail.title ? dropDetail.title : ''}
                                        onChange={(e) => { setDropDetail({ ...dropDetail, title: e.target.value }) }}
                                    />
                                </Stack>
                                <Stack gap={1}>
                                    <span className="badge badge-info text-white">Symbol *</span>
                                    <input
                                        type="text"
                                        placeholder="Enter Name"
                                        className="input input-bordered input-info w-full"
                                        value={dropDetail.symbol ? dropDetail.symbol : ''}
                                        onChange={(e) => { setDropDetail({ ...dropDetail, symbol: e.target.value }) }}
                                    />
                                </Stack>
                            </Stack>
                            <Stack gap={1} width='100%'>
                                <span className="badge badge-info text-white">Description *</span>
                                <textarea
                                    rows={4}
                                    placeholder="Enter Description"
                                    className="textarea textarea-info textarea-bordered w-full py-3"
                                    value={dropDetail.description ? dropDetail.description : ''}
                                    onChange={(e) => { setDropDetail({ ...dropDetail, description: e.target.value }) }}
                                />
                            </Stack>
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
                        <Stack gap={1} width='100%'>
                            <Stack direction='row' flexWrap='wrap' alignItems='center' gap={1}>
                                <span className="badge badge-info text-white">Supply *</span>
                                <span className='badge badge-sm'>How many total tokens will be available to collect</span>
                            </Stack>
                            <Stack direction='row' gap={2}>
                                <input
                                    type="range"
                                    min={50}
                                    max={1000}
                                    value={dropDetail.supply}
                                    onChange={(e) => {
                                        const value = Number(e.target.value)
                                        if (50 <= value && value <= 1000) {
                                            setDropDetail({ ...dropDetail, supply: value })
                                        }
                                    }}
                                    className="range range-info range-xs mt-2 w-full"
                                />
                                <input
                                    type="number"
                                    placeholder="Enter Supply"
                                    className="input input-bordered input-info input-sm w-auto min-w-[120px]"
                                    value={dropDetail.supply ? dropDetail.supply : ''}
                                    onChange={(e) => {
                                        const value = Number(e.target.value)
                                        if (50 <= value && value <= 1000) {
                                            setDropDetail({ ...dropDetail, supply: value })
                                        }
                                    }}
                                />
                            </Stack>
                        </Stack>
                        <Stack gap={1} width='100%'>
                            <Stack direction='row' flexWrap='wrap' alignItems='center' gap={1}>
                                <span className="badge badge-info text-white">Royalties *</span>
                                <span className='badge badge-sm'>Your earnings percentage per token sold in this drop.</span>
                            </Stack>
                            <Stack direction='row' gap={2}>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={dropDetail.royalty}
                                    onChange={(event) => {
                                        const value = Number(event.target.value)
                                        if (0 <= value && value <= 100) {
                                            setDropDetail({ ...dropDetail, royalty: Number(value) })
                                        }
                                    }}
                                    className="range range-info range-xs mt-2 w-full"
                                />
                                <input
                                    type="number"
                                    placeholder="Enter Royalties"
                                    className="input input-bordered input-info input-sm w-auto min-w-[120px]"
                                    value={dropDetail.royalty ? dropDetail.royalty : ''}
                                    onChange={(event) => {
                                        const value = Number(event.target.value)
                                        if (0 <= value && value <= 100) {
                                            setDropDetail({ ...dropDetail, royalty: Number(value) })
                                        }
                                    }}
                                />
                            </Stack>
                        </Stack>
                        <Stack gap={2} direction={{ sm: 'column', md: 'row' }}>
                            <Stack gap={1} width='100%'>
                                <Stack direction='row' flexWrap='wrap' alignItems='center' gap={1}>
                                    <span className="badge badge-info text-white">Duration *</span>
                                    <span className='badge badge-sm'>How long the drop will be available to claim</span>
                                </Stack>
                                <Stack direction='row' gap={2}>
                                    <input
                                        type="number"
                                        placeholder="Enter Supply"
                                        className="input input-bordered input-info input-sm w-full"
                                        value={dropDetail.duration ? dropDetail.duration : ''}
                                        onChange={(event) => {
                                            const value = Number(event.target.value)
                                            setDropDetail({ ...dropDetail, duration: value })
                                        }}
                                    />
                                    <select
                                        className="select select-info select-sm w-full"
                                        value={dropDetail.durationUnit}
                                        onChange={(event) => {
                                            const selectedValue = parseInt(event.target.value, 10);
                                            const isValidValue = Object.values(DurationUnit).includes(selectedValue);

                                            if (isValidValue) {
                                                setDropDetail({
                                                    ...dropDetail,
                                                    durationUnit: selectedValue
                                                });
                                            }
                                        }}
                                    >
                                        {dateData.map(item => (
                                            <option value={item.value} key={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                </Stack>
                            </Stack>
                            <Stack gap={1} width='100%'>
                                <Stack direction='row' flexWrap='wrap' alignItems='center' gap={1}>
                                    <span className="badge badge-info text-white">Price *</span>
                                    <label className="swap swap-flip">
                                        <input
                                            type="checkbox"
                                            checked={isFree}
                                            onChange={(event) => {
                                                const value = event.target.value
                                                if (value === 'on') {
                                                    setIsFree(prevStats => !prevStats)
                                                }
                                            }}
                                        />
                                        <span className="badge badge-success badge-sm text-white swap-on">Free</span>
                                        <span className="badge badge-error badge-sm text-white swap-off">Paid</span>
                                    </label>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-info toggle-sm"
                                        checked={isFree}
                                        onChange={(event) => {
                                            const value = event.target.value
                                            if (value === 'on') {
                                                setIsFree(prevStats => !prevStats)
                                            }
                                        }}
                                    />
                                </Stack>
                                <Stack direction='row' gap={2}>
                                    <input
                                        type="number"
                                        placeholder="Enter Supply"
                                        className="input input-bordered input-info input-sm w-full"
                                        value={price ? price : ''}
                                        disabled={isFree}
                                        onChange={(event) => {
                                            const value = Number(event.target.value)
                                            setPrice(value)
                                        }}
                                    />
                                    <select
                                        className="select select-info select-sm w-full"
                                        value={currency || currencyData.find(item => item.chainId === chain?.id)?.currency[0].value || ''}
                                        disabled={isFree}
                                        onChange={(event) => {
                                            setCurrency(event.target.value)
                                        }}
                                    >
                                        {currencyData.find(item => item.chainId === chain?.id)?.currency.map(item => (
                                            <option value={item.value} key={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                    <div className="divider" />
                    <Stack direction='row' flexWrap={'wrap'} gap={2} alignItems={'center'}>
                        <span className="badge badge-neutral badge-lg text-white">{dropDetail.supply} Editions</span>
                        <span className="badge badge-error badge-lg text-white">{dropDetail.royalty}% Royalties</span>
                        <span className="badge badge-success badge-lg text-white">Duration: {dropDetail.duration} {dateData.find(item => item.value === dropDetail.durationUnit)?.label}</span>
                        <span className="badge badge-primary badge-lg text-white">Price: {isFree ? 'Free' : (currencyData.find(item => item.chainId === chain?.id)?.currency.find(item => item.value === currency)?.label ? price + ' ' + currencyData.find(item => item.chainId === chain?.id)?.currency.find(item => item.value === currency)?.label : '')}</span>
                    </Stack>
                    <div className="divider" />
                    <Button className="w-full mb-5 justify-center" onClick={() => handleCreateDrop()}>Create Drop</Button>
                </Stack>
            )}
        </Stack>
    )
}
