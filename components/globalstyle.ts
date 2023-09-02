import tw from "tailwind-styled-components";

type ChipsSize = {
    size?: 'small' | 'medium' | 'large'
}

export const IconButton = tw.button`
    bg-sky-500
    hover:bg-sky-400
    text-white 
    p-2.5
    rounded-full
    transition-all
`

export const Button = tw.button<{ outlined?: boolean, size?: string }>`
    rounded-full
    transition-all
    flex
    items-center
    gap-2
    ${({ outlined }) => outlined ? 'bg-transparent border border-sky-500 hover:border-sky-400 text-sky-500 hover:text-sky-400' : 'bg-sky-500 hover:bg-sky-400 text-white'}
    ${({ size }) => size === 'small' ? 'py-1.5 px-3' : size === 'large' ? 'py-4 px-8' : 'py-2.5 px-5'}
`