export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    level: string;
}

export interface UserRequest {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    notes: string;
    level: string;
}