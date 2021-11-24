import React from 'react';
import { FormControl } from 'erxes-ui';
import { IFormProps } from 'erxes-ui/lib/types';
import { IUser } from 'erxes-ui/lib/auth/types';

export const description = (formProps: IFormProps, item: any) => {
  return (
    <FormControl
      {...formProps}
      placeholder='Description'
      componentClass='textarea'
      name='description'
      defaultValue={item.description}
    />
  );
};

export const title = (formProps: IFormProps, item: any) => {
  return (
    <>
      <FormControl
        {...formProps}
        placeholder='Title'
        type='text'
        name='title'
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
