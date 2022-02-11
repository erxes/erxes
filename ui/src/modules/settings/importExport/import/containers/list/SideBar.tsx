import { Spinner } from 'erxes-ui';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../../graphql';

type Props = {};

type State = {};

type FinalProps = {
  importHistoryGetExportablePlugins: any;
} & Props;

class SideBarContainer extends React.Component<FinalProps, State> {
  render() {
    const { importHistoryGetExportablePlugins } = this.props;

    if (importHistoryGetExportablePlugins.loading) {
      return <Spinner />;
    }

    console.log(importHistoryGetExportablePlugins);

    return <div>aaa</div>;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.importHistoryGetExportablePlugins), {
      name: 'importHistoryGetExportablePlugins'
    })
  )(SideBarContainer)
);
