export interface metaDataTypes {
    label: string,
    value: string,
    checked: boolean
}

export interface DropDetailTypes {
    title: string,
    symbol: string,
    description: string,
    supply: number,
    royalty: number,
    duration: number,
    durationUnit?: DurationUnit,
    metadatas?: string[]
}

export interface dateDataTypes {
    label: string,
    value: DurationUnit,
    time: number
}

export enum DurationUnit {
    min,
    hr,
    day,
    Month
}


export interface DetailsType {
    contractAddress: string;
    network: string;
    tokenID: string;
    ownerAddress: string;
}