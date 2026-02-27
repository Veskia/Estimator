export interface Inventory {
    id: number;
    vendor: string;
    material: string;
    want: number;
    onhand: number;
    last_update: string;
    user: string;
    procurement: string;
    notes: string;
    value: number;
    update: false;
}
