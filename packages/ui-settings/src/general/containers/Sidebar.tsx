import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import SideBar from '../components/Sidebar';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import { SideBarItem } from '../types';

type FinalProps = {
  checkPremiumServiceQuery?: any;
  item?: SideBarItem;
};

class SidebarContainer extends React.Component<FinalProps> {
  render() {
    const { checkPremiumServiceQuery, item } = this.props;

    if (checkPremiumServiceQuery.loading) {
      return <Spinner objective={true} />;
    }

    return (
      <SideBar
        isThemeEnabled={checkPremiumServiceQuery.configsCheckPremiumService}
        item={item}
      />
    );
  }
}

export default withProps<FinalProps>(
  compose(
    graphql<{}>(gql(queries.configsCheckPremiumService), {
      name: 'checkPremiumServiceQuery',
      options: {
        variables: { type: 'isThemeServiceEnabled' }
      }
    })
  )(SidebarContainer)
);
