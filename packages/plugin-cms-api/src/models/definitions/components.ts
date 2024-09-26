import { Document, Schema } from 'mongoose';

export interface IComponent {
    type: string;
    content: string;
    tailwindClasses: string;
}

export interface IComponentDocument extends IComponent, Document {
    _id: string;
}

export const componentSchema = new Schema<IComponentDocument>(
    {
        type: { type: String, required: true },
        content: { type: Schema.Types.Mixed, required: true },
        tailwindClasses: { type: String, required: true },
    }
)