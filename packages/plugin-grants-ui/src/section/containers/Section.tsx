import React from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withProps } from '@erxes/ui/src/utils/core';
import { queries } from '../graphql';
import { RequestQueryResponse } from '../../common/section/type';
import { Spinner } from '@erxes/ui/src';

import SectionComponent from '../components/Section';

type Props = {
  history: any;
  queryParams: any;
  mainType: string;
  mainTypeId: string;
};

type FinalProps = {
  requestQuery: RequestQueryResponse;
} & Props;

class Section extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { requestQuery } = this.props;
    if (requestQuery?.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      request: requestQuery.grantRequest || {}
    };

    return <SectionComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.grantRequest), {
      name: 'requestQuery',
      skip: ({ mainTypeId, mainType }) => !mainTypeId || !mainType,
      options: ({ mainType, mainTypeId }) => ({
        variables: { cardType: mainType, cardId: mainTypeId }
      })
    })
  )(Section)
);
