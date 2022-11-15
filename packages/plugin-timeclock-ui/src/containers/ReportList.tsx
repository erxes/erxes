import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import ReportList from '../components/ReportList';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {} & Props;
const ListContainer = (props: FinalProps) => {
  return <ReportList {...props} />;
};

export default withProps<Props>(compose()(ListContainer));
