import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import PosList from '../../components/Pos/PosList';
import { queries } from '../../graphql';
import { PosListQueryResponse } from '../../types';

type Props = { history: any; queryParams: any };

type FinalProps = {
  posListQuery: PosListQueryResponse;
} & Props;

const PosListContainer = (props: FinalProps) => {
  const { posListQuery } = props;

  const extendedProps = {
    ...props,
    posList: posListQuery.allPos || []
  };

  return <PosList {...extendedProps} />;
};

export default compose(
  graphql<Props, PosListQueryResponse>(gql(queries.posList), {
    name: 'posListQuery'
  })
)(PosListContainer);
