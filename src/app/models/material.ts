export interface Material {
    id: number;
    name: string;
    multiplier: number;
    c32: number;
    c100: number;
    c500: number;
    c1000: number;
    c2500: number;
    c5000: number;
    c10000: number;
    scrap: number;
    width: number;
    width2: number;
    width3: number;
    width4: number;
    margin: number;
    startingSqFt: number;
    diecut: boolean;
    laminate: string;
    materialType: string;
    weight: number;
    lastUpdate: Date;
    active: boolean;
    company: string;
}