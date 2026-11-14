import type { UseFormReturn } from 'react-hook-form';
import type { IPropertyForm, IPropertyValues } from '../propertySchema';

export type PropertyFormApi = UseFormReturn<IPropertyForm, unknown, IPropertyValues>;
