import { Bulk } from '@erxes/ui/src/components';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps, router } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import FilterDeal from '../components/FilterDeal';
import { queries } from '../graphql';
type Props = {
  checked: any;
  deals: any;
  loading: boolean;
};

class FilterDealsContainer extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const content = props => <FilterDeal {...props} />;

    const refetch = () => {
      this.props.checked.refetch();
    };

    return <Bulk content={content} refetch={refetch} />;
  }
}

export default FilterDealsContainer;
