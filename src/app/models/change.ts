export interface Change {
    id: number;
    location: string;
    company: string;
    operation: string;
    userId: number;
    userEmail: string;
    itemId: number;
    itemName: string;
    colName: string;
    previousVal: string;
    newVal: string;
    date: Date;
}
