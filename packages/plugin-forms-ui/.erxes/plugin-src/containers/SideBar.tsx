import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Sidebar from '../components/Sidebar';
import { queries } from '@erxes/ui-settings/src/properties/graphql';

type Props = {
  currentType: string;
};

type State = {};

type FinalProps = {
  fieldsGetTypes: any;
} & Props;

class SideBarContainer extends React.Component<FinalProps, State> {
  render() {
    const { fieldsGetTypes, currentType } = this.props;

    if (fieldsGetTypes.loading) {
      return <Spinner />;
    }

    const services = fieldsGetTypes.fieldsGetTypes || [];

    return <Sidebar currentType={currentType} services={services} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.fieldsGetTypes), {
      name: 'fieldsGetTypes'
    })
  )(SideBarContainer)
);
