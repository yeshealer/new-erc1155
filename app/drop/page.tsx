"use client"
import DropPage from '@/components/pages/DropPage'
import { useRouter } from 'next/router'

export default function Drop() {
    const router = useRouter()
    return (
        <>
            {router.isFallback ? (
                <div>Loading...</div>
            ) : (
                <DropPage />
            )}
        </>
    )
}
