const useIPFS = () => {
    const resolveLink = (url: string) => {
        if (!url || !url.includes("ipfs://")) return url
        return url.replace("ipfs://", "https://gateway.ipfs.io/ipfs/")
    }

    const get3DImageLink = async (url: string) => {
        let imageLink = ''
        await fetch(resolveLink(url)).then(res => res.json()).then(
            (res) => imageLink = res.animation
        ).catch(err => console.log(err))
        return resolveLink(imageLink)
    }

    return {
        resolveLink, get3DImageLink
    }
}

export default useIPFS
