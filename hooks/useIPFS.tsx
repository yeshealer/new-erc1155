import { metaDataTypes } from '@/constants/type';
import axios from 'axios'

const useIPFS = () => {
    const pinataAPIKey = process.env.PINATA_API_KEY;
    const pinataAPISecret = process.env.PINATA_API_SECRET;

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

    const sendFileToIPFS = async (fileImg: string) => {
        try {
            const formData = new FormData();
            formData.append('file', fileImg);
            const resFile = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers: {
                    'pinata_api_key': pinataAPIKey,
                    'pinata_secret_api_key': pinataAPISecret,
                    "Content-Type": "multipart/form-data"
                },
            })

            const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
            return ImgHash
        } catch (err) {
            console.log(err)
        }
    }

    const sendJSONtoIPFS = async (ImgHash: string, nftName: string, nftDescription: string, selectedMetaDatas: metaDataTypes[]) => {
        try {
            const resJSON = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
                data: {
                    "name": nftName,
                    "description": nftDescription,
                    "animation": ImgHash,
                    "animation_url": ImgHash,
                    "attributes": selectedMetaDatas.map((selectedMetaData, i) => ({ "trait_type": selectedMetaData.label, "value": selectedMetaData.value }))
                },
                headers: {
                    'pinata_api_key': pinataAPIKey,
                    'pinata_secret_api_key': pinataAPISecret,
                },
            });

            const tokenURI = `ipfs://${resJSON.data.IpfsHash}`;
            return tokenURI;
        } catch (error) {
            console.log(error);
        }
    }

    return {
        resolveLink,
        get3DImageLink,
        sendFileToIPFS,
        sendJSONtoIPFS
    }
}

export default useIPFS
