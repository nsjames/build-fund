// place files you want to import through the `$lib` alias in this folder.
import {Chains} from "@wharfkit/session";

export const commaSeparatedNumber = (num: number): string => {
    const numStr = num.toString();
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

export const getReadableRequested = (requested: string) => {
    const [amount, symbol] = requested.split(' ');
    return `${commaSeparatedNumber(parseFloat(amount))} ${symbol}`;
}

export const getExplorerUrl = () => {
    return `https://jungle4.unicove.com/en/jungle4`
}

export const getChain = () => {
    return Chains.Jungle4;
}

export const getSummaryMaxLength = () => 300;

export const timeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const diffSeconds = Math.floor(diff / 1000);
    if (diffSeconds < 60) {
        return `${diffSeconds}s ago`;
    }

    const diffMinutes = Math.floor(diff / (1000 * 60));
    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    if (diffHours < 48) {
        return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${diffDays}d ago`;
};

export const unixDate = (dateString: string) => {
    return new Date(dateString + 'Z');
}