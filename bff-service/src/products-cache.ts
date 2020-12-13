const cache = new Map<string, [{ products: Product[] }, number] >();
const key = 'products_list';
const expirationTimeInSeconds = 120;

interface Product {
    id?: string;
    title: string;
    description: string;
    price: number;
    count?: number;
}

export default {
    set(value: { products: Product[] }): void {
        cache.set(key, [value, Date.now()])
    },

    getData(): { products: Product[] } {
        return cache.get(key)[0];
    },

    clear(): void {
        cache.clear();
    },

    hasData(): boolean {
        return cache.has(key);
    },

    isNotExpired(): boolean {
        const [_, timestamp] = cache.get(key)
        return (Date.now() - timestamp) / 1000 < expirationTimeInSeconds;
    }
}