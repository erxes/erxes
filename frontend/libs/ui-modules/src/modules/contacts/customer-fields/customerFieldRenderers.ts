import { FC } from 'react';
import {
  AvatarField,
  BirthDateField,
  CodeField,
  DescriptionField,
  FirstNameField,
  IsSubscribedField,
  LastNameField,
  MiddleNameField,
  OwnerIdField,
  PrimaryEmailField,
  PrimaryPhoneField,
  SexField,
  StateField,
  TCustomerFieldProps,
} from './CustomerFormFields';

// Basic information codes this module can draw; tags stay outside the layout.
export const CUSTOMER_FIELD_RENDERERS: Record<
  string,
  FC<TCustomerFieldProps>
> = {
  avatar: AvatarField,
  firstName: FirstNameField,
  middleName: MiddleNameField,
  lastName: LastNameField,
  code: CodeField,
  ownerId: OwnerIdField,
  primaryEmail: PrimaryEmailField,
  primaryPhone: PrimaryPhoneField,
  sex: SexField,
  birthDate: BirthDateField,
  isSubscribed: IsSubscribedField,
  description: DescriptionField,
  state: StateField,
};
