import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
// import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import List from '../components/List';
import { queries } from '../graphql';
import { AutomationsQueryResponse } from '../types';

type IProps = {};

type FinalProps = {
  automationsQuery: AutomationsQueryResponse;
} & IProps &
  IRouterProps;

const AutomationsContainer = (props: FinalProps) => {
  const { automationsQuery } = props;

  if (automationsQuery.loading) {
    return null;
  }

  const automations = automationsQuery.automations || [];

  const updatedProps = {
    ...props,
    loading: automationsQuery.loading,
    automations
  };

  return <List {...updatedProps} />;
};

export default withProps<{}>(
  compose(
    graphql<{}, AutomationsQueryResponse, {}>(gql(queries.automations), {
      name: 'automationsQuery'
    })
    // )(withRouter<IRouterProps>(AutomationsContainer))
  )(AutomationsContainer)
);
