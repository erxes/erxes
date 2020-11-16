import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Home from '../components/Home';
import { queries } from '../graphql';
import { GroupGetLastQueryResponse } from '../types';

type MainProps = {
  history: any;
  queryParams: any;
};

type HomeContainerProps = MainProps & {
  groupId: string;
};

class HomeContainer extends React.Component<HomeContainerProps> {
  componentWillReceiveProps(nextProps) {
    const { history, groupId, queryParams } = nextProps;

    if (!queryParams.groupId && groupId) {
      routerUtils.setParams(history, { groupId });
    }
  }

  render() {
    return <Home {...this.props} />;
  }
}

type LastGroupProps = MainProps & {
  groupGetLastQuery: GroupGetLastQueryResponse;
};

// Getting lastGroup id to currentGroup
const LastGroup = (props: LastGroupProps) => {
  const { groupGetLastQuery } = props;

  if (groupGetLastQuery.loading) {
    return <Spinner objective={true} />;
  }

  const lastGroup = groupGetLastQuery.calendarGroupGetLast || {};

  const extendedProps = {
    ...props,
    groupId: lastGroup._id
  };

  return <HomeContainer {...extendedProps} />;
};

type HomerProps = { queryParams: any } & IRouterProps;

const LastGroupContainer = withProps<MainProps>(
  compose(
    graphql<MainProps, GroupGetLastQueryResponse, {}>(
      gql(queries.groupGetLast),
      {
        name: 'groupGetLastQuery'
      }
    )
  )(LastGroup)
);

// Main home component
const MainContainer = (props: HomerProps) => {
  const { history } = props;
  const groupId = routerUtils.getParam(history, 'groupId');

  if (groupId) {
    const extendedProps = { ...props, groupId };

    return <HomeContainer {...extendedProps} />;
  }

  return <LastGroupContainer {...props} />;
};

export default withRouter<HomerProps>(MainContainer);
