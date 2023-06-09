import React from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import { withProps } from '@erxes/ui/src/utils/core';
import { queries } from '../graphql';
import { RequestQueryResponse } from '../../common/type';
import { Spinner, withCurrentUser } from '@erxes/ui/src';

import SectionComponent from '../components/Section';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  history: any;
  queryParams: any;
  mainType: string;
  mainTypeId: string;
  object: any;
};

type FinalProps = {
  requestQuery: RequestQueryResponse;
  currentUser: IUser;
} & Props;

class Section extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { requestQuery, currentUser, mainType, mainTypeId } = this.props;
    if (requestQuery?.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      ...this.props,
      contentType: mainType,
      contentTypeId: mainTypeId,
      request: requestQuery.grantRequest || {},
      currentUser
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
        variables: { contentType: mainType, contentTypeId: mainTypeId }
      })
    })
  )(withCurrentUser(Section))
);
