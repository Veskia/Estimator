export interface Finishing {
    id: number;
    name: string;
    c8: number;
    c20: number;
    c21: number;
    lastUpdate?: Date; // Added ? because it might not exist until saved
    company: string;
    active: boolean;
}