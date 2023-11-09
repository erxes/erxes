import React from 'react';
import ChartForm from '../../components/chart/ChartForm';
type Props = {
  history: any;
  queryParams: any;
  toggleForm: () => void;
};

const ChartFormList = (props: Props) => {
  const { history, queryParams } = props;
  const serviceTypes = ['cards', 'inbox', 'leads', 'customers', 'companies'];
  return <ChartForm serviceTypes={serviceTypes} {...props} />;
};

export default ChartFormList;
