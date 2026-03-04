export function randomValueFromArray(arr: string[]): string {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}