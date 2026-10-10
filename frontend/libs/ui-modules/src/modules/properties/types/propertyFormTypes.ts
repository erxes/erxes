import { z } from 'zod';
import { propertyGroupSchema, propertySchema } from '../propertySchema';

export type IPropertyGroupForm = z.infer<typeof propertyGroupSchema>;
export type IPropertyForm = z.infer<typeof propertySchema>;
