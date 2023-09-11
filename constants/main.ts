import { DurationUnit, dateDataTypes, metaDataTypes } from "./type";

export const HeaderLink = [
    { title: 'Create', link: '' },
    { title: 'Bridge', link: 'bridge' },
    { title: 'Explore', link: 'explore' }
]

export const SupportNetworkIcons = [
    'https://uploads-ssl.webflow.com/63a2c61aa129844c234c2169/63a464686ccbdb058e4af846_coin-1.png',
    'https://uploads-ssl.webflow.com/63a2c61aa129844c234c2169/63a46468c97e6a13c51b71da_coin-3.png',
    'https://uploads-ssl.webflow.com/63a2c61aa129844c234c2169/63a46468ed595569c2105e34_coin-2.png',
    'https://uploads-ssl.webflow.com/63a2c61aa129844c234c2169/63a46467f8cc91508e1df57a_coin-4.png',
    'https://uploads-ssl.webflow.com/63a2c61aa129844c234c2169/63a46468a711d8b4d0be1291_coin-7.png'
]

export const NetworkList = [
    {
        network: 'Sepolia',
        id: 11155111,
        currency: 'ETH',
        explorer: 'https://sepolia.etherscan.io/address/',
        image: 'https://uploads-ssl.webflow.com/63a2c61aa129844c234c2169/63a464686ccbdb058e4af846_coin-1.png',
        dstChainId: 10161
    },
    {
        network: 'Mumbai',
        id: 80001,
        currency: 'MATIC',
        explorer: 'https://mumbai.polygonscan.com/address/',
        image: 'https://uploads-ssl.webflow.com/63a2c61aa129844c234c2169/63a46468ed595569c2105e34_coin-2.png',
        dstChainId: 10109
    },
    {
        network: 'Fuji',
        id: 43113,
        currency: 'AVAX',
        explorer: 'https://testnet.snowtrace.io/address/',
        image: 'https://uploads-ssl.webflow.com/63a2c61aa129844c234c2169/63a46467f8cc91508e1df57a_coin-4.png',
        dstChainId: 10106
    },
]

export const metaDataOptions: metaDataTypes[] = [
    { label: "Metus malesuada", value: '0', checked: false },
    { label: "ASH SUUJ", value: '1', checked: false },
    { label: "Tincidunt vel", value: '2', checked: false },
    { label: "Massa suspendisse", value: '3', checked: false },
    { label: "Tempor tempus", value: '4', checked: false },
    { label: "Neque cras", value: '5', checked: false },
    { label: "Congue cras", value: '6', checked: false },
    { label: "Urna mi", value: '7', checked: false },
    { label: "Eget lectus", value: '8', checked: false }
];

export const dateData: dateDataTypes[] = [
    { label: 'Minutes', value: DurationUnit.min, time: 60 },
    { label: 'Hours', value: DurationUnit.hr, time: 3600 },
    { label: 'Days', value: DurationUnit.day, time: 86400 },
    { label: 'Month', value: DurationUnit.Month, time: 2592000 }
]

export const currencyData = [
    {
        chainId: 11155111, currency: [
            { label: 'ETH', value: 'eth' },
        ]
    },
    {
        chainId: 80001, currency: [
            { label: 'MATIC', value: 'matic' },
        ]
    },
    {
        chainId: 43113, currency: [
            { label: 'AVAX', value: 'avax' },
        ]
    }
]