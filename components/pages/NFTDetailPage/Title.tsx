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
            <Link href={`/nft/${collection.id}`} className="text-sky-500">{collection.collectionName}</Link>
            <div className="text-3xl font-bold mt-2">{nftData.nftName}</div>
            {address && <div className="text-base font-medium">{nftData.supply} owned by <Link href={`/${nftData.ownerAddress}`} className="cursor-pointer text-sky-500">{nftData.ownerAddress.toLocaleLowerCase() === address.toLocaleLowerCase() ? 'you' : `${nftData.ownerAddress.slice(0, 6).toLocaleUpperCase()}`}</Link></div>}
        </Stack>
    )
}
