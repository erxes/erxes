import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { router, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import Sidebar from '../components/SideBar';
import { queries } from '../graphql';

type Props = {
  currentType: string;
  history: any;
};

type State = {};

type FinalProps = {
  historyGetTypes: any;
} & Props;

class SideBarContainer extends React.Component<FinalProps, State> {
  render() {
    const { historyGetTypes, currentType, history } = this.props;

    if (historyGetTypes.loading) {
      return <Spinner />;
    }

    const services = historyGetTypes.historyGetTypes || [];

    if (!router.getParam(history, 'type') && services.length !== 0) {
      router.setParams(history, { type: services[0].contentType }, true);
    }

    return <Sidebar currentType={currentType} services={services} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.historyGetTypes), {
      name: 'historyGetTypes'
    })
  )(SideBarContainer)
);
