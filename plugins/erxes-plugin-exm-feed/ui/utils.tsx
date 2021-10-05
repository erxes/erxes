import React from "react";
import { FormControl } from "erxes-ui";
import { IFormProps } from "erxes-ui/lib/types";

export const description = (formProps: IFormProps, item: any) => {
  return (
    <FormControl
      {...formProps}
      placeholder="Description"
      componentClass="textarea"
      name="description"
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
        defaultValue={item.title}
      />
    </>
  );
};
