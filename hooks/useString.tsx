export const useString = () => {
    const L = (value: string) => {
        return value.toLocaleLowerCase();
    }

    return {
        L
    }
}