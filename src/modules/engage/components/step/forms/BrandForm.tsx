import { BrandForm } from 'modules/settings/brands/components';
import * as React from 'react';

type Props = {
  save: (params: { doc: { name: string; description: string } }) => void;
  afterSave: () => void;
};

const Form = ({ save, afterSave }: Props) => {
  return <BrandForm save={save} afterSave={afterSave} modal={false} />;
};

export default Form;
