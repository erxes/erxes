import React from 'react';

type Props = {
  fieldType: string;
  fieldQuery?: string;
  multi?: boolean;
  onChange?: (input: any) => void;
  value?: any;
};
const ChartFormField = (props: Props) => {
  const { fieldType } = props;

  return <div>Anything other than select</div>;
};

export default ChartFormField;
