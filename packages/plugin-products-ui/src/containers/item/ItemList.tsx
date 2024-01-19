import React from 'react';
import { withProps } from '@erxes/ui/src/utils';
import { ItemsCountQueryResponse, ItemsQueryResponse } from '../../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {} & Props;

class ItemListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    return <>hi</>;
  }
}

export default withProps<Props>(ItemListContainer);
