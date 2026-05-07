export interface Student {
    _id?: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    courseEnrolled: string;
    password: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}