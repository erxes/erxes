import { AddTrigger } from 'modules/boards/components/portable';
import * as React from 'react';
import options from '../options';

type Props = {
  customerIds?: string[];
};

export default (props: Props) => {
  const { customerIds } = props;

  return <AddTrigger options={options} customerIds={customerIds} />;
};
