import React from 'react';
import { gql } from '@apollo/client';
import { queries } from '../graphql';
import { RequestQueryResponse } from '../../common/type';
import { Spinner, withCurrentUser } from '@erxes/ui/src';

import SectionComponent from '../components/Section';
import { IUser } from '@erxes/ui/src/auth/types';
import { useQuery } from '@apollo/client';
import { IGrantRequest } from '../../common/type';

type Props = {
  history: any;
  queryParams: any;
  mainType: string;
  mainTypeId: string;
  object: any;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const Section: React.FC<FinalProps> = (props) => {
  const { currentUser, mainType, mainTypeId } = props;

  const requestQuery = useQuery<RequestQueryResponse>(
    gql(queries.grantRequest),
    {
      variables: { contentType: mainType, contentTypeId: mainTypeId },
      skip: !mainTypeId || !mainType,
    },
  );
  if (requestQuery?.loading) {
    return <Spinner />;
  }

  const updatedProps = {
    ...props,
    contentType: mainType,
    contentTypeId: mainTypeId,
    request:
      (requestQuery.data && requestQuery.data.grantRequest) ||
      ({} as IGrantRequest),
    currentUser,
  };

  return <SectionComponent {...updatedProps} />;
};

export default withCurrentUser(Section);
