import gql from 'graphql-tag';
import { PipelinesQueryResponse } from 'modules/boards/types';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Templates from '../components/Templates';
import { queries } from '../graphql';

type Props = {
  show: boolean;
  closeModal: () => void;
};

type FinalProps = {
  templatesQuery: any;
} & Props;

class PipelinesContainer extends React.Component<FinalProps> {
  render() {
    const { templatesQuery } = this.props;

    if (templatesQuery.loading) {
      return <Spinner />;
    }

    const extendedProps = {
      ...this.props,
      templates: templatesQuery.growthHackTemplates || []
    };

    return <Templates {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, PipelinesQueryResponse, { boardId: string }>(
      gql(queries.growthHackTemplates),
      {
        name: 'templatesQuery'
      }
    )
  )(PipelinesContainer)
);
