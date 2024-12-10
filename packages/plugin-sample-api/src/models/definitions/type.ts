import { Document, Schema } from 'mongoose';

export interface IType {
    name: string;
}

export interface ITypeDocument extends IType, Document {
    _id: string;
}

export const typeSchema = new Schema({
    name: { type: String, required: true },
});