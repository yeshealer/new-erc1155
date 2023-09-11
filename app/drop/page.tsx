"use client"
import DropPage from '@/components/pages/DropPage'
import React, { useEffect, useState } from 'react'

export default function Drop() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsReady(true)
        }
    }, [])

    return (
        isReady && <DropPage />
    )
}
