import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { router, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Sidebar from '../../components/list/SideBar';
import { queries } from '../../graphql';

type Props = {
  currentType: string;
  history: any;
};

type State = {};

type FinalProps = {
  importHistoryGetExportableServices: any;
} & Props;

class SideBarContainer extends React.Component<FinalProps, State> {
  render() {
    const {
      importHistoryGetExportableServices,
      currentType,
      history
    } = this.props;

    if (importHistoryGetExportableServices.loading) {
      return <Spinner />;
    }

    const services =
      importHistoryGetExportableServices.importHistoryGetExportableServices ||
      [];

    if (!router.getParam(history, 'type') && services.length !== 0) {
      router.setParams(history, { type: services[0].contentType }, true);
    }

    return <Sidebar currentType={currentType} services={services} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.importHistoryGetExportableServices), {
      name: 'importHistoryGetExportableServices'
    })
  )(SideBarContainer)
);
