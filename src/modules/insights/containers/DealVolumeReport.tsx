import * as React from 'react';
import { DealVolumeReport } from '../components';
import { IQueryParams } from '../types';

type Props = {
  history: any;
  queryParams: IQueryParams;
};

const DealVolumeReportContainer = (props: Props) => {
  return <DealVolumeReport {...props} />;
};

export default DealVolumeReportContainer;
