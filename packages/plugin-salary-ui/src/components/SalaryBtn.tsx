import Button from '@erxes/ui/src/components/Button';
import React from 'react';

type Props = {
  queryParams: any;
};

export default (props: Props) => {
  const { queryParams } = props;

  const gotoSalaryReport = () => {
    window.open('/profile/salaries/bichil', '_blank', 'noreferrer');
  };

  return <Button onClick={gotoSalaryReport}>Salaries</Button>;
};
