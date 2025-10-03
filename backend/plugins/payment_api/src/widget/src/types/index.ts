export interface Invoice {
    _id: string;
    invoiceNumber: string;
    currency: string;
    amount: number;
    phone: string;
    email: string;
    description: string;
    customerId: string;
    customerType: string;
    contentType: string;
    contentTypeId: string;
    paymentIds: string[];
    redirectUri: string;
    warningText: string;
    data?: any;
    transactions: Transaction[];
}

export interface Payment {
    _id: string;
    name: string;
    kind: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    _id: string;
    amount: number;
    createdAt: string;
    paymentId: string;
    paymentKind: string;
    status: string;
    response: string;
    details: any;
}

