export function round(number, decimals){
    if (decimals >0){
        return Math.round(number*(10**decimals))/(10**decimals);
    }
    return Math.round(number);
};