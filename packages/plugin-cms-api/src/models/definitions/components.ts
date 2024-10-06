import { Document, Schema } from 'mongoose';
import {nanoid} from 'nanoid';

export interface IComponent {
    type: string;
    content: string;
}

export interface IComponentDocument extends IComponent, Document {
    _id: string;
}

export const componentSchema = new Schema<IComponentDocument>(
    {
        _id: { type: String, default: () => nanoid() },
        type: { type: String, required: true },
        content: { type: Schema.Types.Mixed, required: true },
    }
)