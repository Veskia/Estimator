export interface ChangeDataPoint {
    operation: string;
    userId: number;
    userName: string;
    colName: string;
    previousVal: string;
    newVal: string;
    date: Date;
}
