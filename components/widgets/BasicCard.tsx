// ** react & next imports
import * as React from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image';
// ** UI imports
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { Button } from '../globalstyle';

interface BasicCardProps {
    symbol: string;
    title: string;
    imageList: string[];
    collectionID: string;
}

export default function BasicCard({
    symbol,
    title,
    imageList,
    collectionID
}: BasicCardProps) {
    const router = useRouter();

    return (
        <Card sx={{ minWidth: 300 }} className='border border-sky-500 border-b-0 bg-gradient-to-t from-sky-50 via-sky-100 to-sky-200'>
            <CardContent>
                <div className='text-gray-500 text-xs'>{symbol}</div>
                <div className='text-2xl font-semibold mt-3'>{title}</div>
                <div className='flex items-center gap-2'>
                    <div className='text-sky-500'>Deployed on</div>
                    <div className='flex items-center gap-2 flex-wrap'>
                        {imageList.map(item => (
                            <Image src={item} alt='network image' width={20} height={20} draggable={false} key={item} />
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardActions>
                <Button className='w-full justify-center' outlined size='small' onClick={() => router.push(`/nft/${collectionID}`)}>Create NFTs</Button>
                <Button className='w-full justify-center' size='small' onClick={() => router.push(`/deploy/${collectionID}`)}>Deploy</Button>
            </CardActions>
        </Card>
    );
}