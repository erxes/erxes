import { Schema } from 'mongoose';

export interface ISample {
    name: string;
    createdAt: Date;
    createdBy: string;
    expiryDate: Date
    checked: boolean
    typeId: string;
}

export interface ISampleDocument extends ISample, Document {
    _id: string;
}

export const sampleSchema = new Schema({
    name: { type: String },
    createdAt: { type: Date, default: new Date() },
    createdBy: { type: String },
    expiryDate: { type: Date },
    checked: { type: Boolean },
    typeId: { type: String }
});