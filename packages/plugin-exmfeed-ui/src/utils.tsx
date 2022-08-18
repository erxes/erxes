import React from 'react';
import { FormControl } from '@erxes/ui/src/components/form';
import { IFormProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';

export const description = (formProps: IFormProps, item: any) => {
  return (
    <FormControl
      {...formProps}
      placeholder="Description"
      componentClass="textarea"
      name="description"
      required={true}
      defaultValue={item.description}
    />
  );
};

export const title = (formProps: IFormProps, item: any) => {
  return (
    <>
      <FormControl
        {...formProps}
        placeholder="Title"
        type="text"
        name="title"
        required={true}
        defaultValue={item.title}
      />
    </>
  );
};

export const getUserOptions = (users: IUser[]) =>
  users.map(user => ({
    value: user._id,
    label: user.details
      ? user.details.fullName || user.email || 'No name'
      : user.email || 'No name'
  }));

export function getDepartmentOptions(array: any[] = []) {
  return array.map(item => ({ value: item._id, label: item.title }));
}
