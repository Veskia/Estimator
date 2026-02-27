export interface Estimate {
    id: number;
    materialId: number;
    materialName: string;
    finishingId: number;
    finishingName: string;
    userCompany: string;
    laminate: boolean;
    diecut: boolean;
    quantity: number;
    height: number;
    width: number;
    materialWidth: number;
    scrap: string;
    manualScrap: number;
    description: string;
    multiplier: number;
    salesMultiplier: number;
    rushMultiplier: number;
    price: number;
    wholesale: number;
    order?: Order; 
}

export interface Order {
    id: number;
    userId: number;
    userEmail: string;
    company: string;
    customer: string;
    address: string;
    city: string;
    state: string;
    zip: number;
    phone: number;
    email: string;
    dateSubmitted: Date;
    dateNeeded: Date;
    estimates?: Estimate[]; 
}