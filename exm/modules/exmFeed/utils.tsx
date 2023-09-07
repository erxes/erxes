import FormControl from "../common/form/Control";
import { IFormProps } from "../common/types";
import { IUser } from "../auth/types";
import React from "react";

export const description = (formProps: IFormProps, item: any) => {
  return (
    <FormControl
      {...formProps}
      placeholder="What's Your Mind? ..."
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
  users.map((user) => ({
    value: user._id,
    label: user.details
      ? user.details.fullName || user.email || "No name"
      : user.email || "No name",
  }));

export function getDepartmentOptions(array: any[] = []) {
  if (!Array.isArray(array)) {
    return [];
  }

  return array.map((item) => ({ value: item._id, label: item.title }));
}
