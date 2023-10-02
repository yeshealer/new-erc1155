import { Stack } from "@mui/material"
import Link from "next/link"
import { useAccount } from "wagmi"

interface TitleProps {
    collection: any
    nftData: any
    isShow?: boolean
}

export default function Title({
    collection,
    nftData,
    isShow
}: TitleProps) {
    const { address } = useAccount();

    return (
        <Stack display={{ xs: isShow ? 'none' : 'block', md: isShow ? 'block' : 'none' }} mb={2}>
            <Link href={`/drop#${nftData.contractAddress}`} className="text-sky-500">{nftData.symbol}</Link>
            <div className="text-3xl font-bold mt-2">{nftData.title}</div>
            {address && <div className="text-base font-medium">{collection.amount.reduce((acc: number, cur: number) => { return acc + cur }, 0)} owned by <Link href={`/${nftData.royalReceiver}`} className="cursor-pointer text-sky-500">{nftData.royalReceiver.toLocaleLowerCase() === address.toLocaleLowerCase() ? 'you' : `${nftData.royalReceiver.slice(0, 6).toLocaleUpperCase()}`}</Link></div>}
        </Stack>
    )
}
