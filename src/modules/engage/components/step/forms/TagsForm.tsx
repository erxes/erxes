import { Form as TagForm } from 'modules/tags/components';
import { ITagSaveParams } from 'modules/tags/types';
import * as React from 'react';

type Props = {
  save: (params: ITagSaveParams) => void;
  afterSave: () => void;
};

const Form = ({ save, afterSave }: Props) => {
  return (
    <TagForm type="customer" save={save} afterSave={afterSave} modal={false} />
  );
};

export default Form;
