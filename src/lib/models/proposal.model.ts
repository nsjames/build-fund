export interface Proposal {
    id: number;
    title: string;
    summary: string;
    proposer: string;
    requested: string;
    approvals: number;
    burned: number;
    date: Date;
    msig: string;

    // only full results
    markdown?: string;
}