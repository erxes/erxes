import { Spinner } from '@erxes/ui/src';
import ErrorBoundary from '@erxes/ui/src/components/ErrorBoundary';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql, useQuery } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
// import { graphql } from '@apollo/client/react/hoc';
import { RiskAssessmentQueryResponse } from '../../common/types';
import SectionComponent from '../components/Section';
import { queries } from '../graphql';
import { Error } from '@erxes/ui/src/components/form/styles';

type Props = {
  queryParams: any;
  mainTypeId: string;
  mainType: string;
};

function Section({ mainType, mainTypeId }: Props) {
  const { data, loading, error } = useQuery(gql(queries.riskAssessment), {
    variables: { cardType: mainType, cardId: mainTypeId },
    skip: !mainTypeId,
  });

  if (loading) {
    return <Spinner />;
  }

  // if (error) {
  //   return <Error>{error.message}</Error>;
  // }

  const { riskAssessment } = data || {};

  const updatedProps = {
    riskAssessments: riskAssessment,
    cardType: mainType,
    cardId: mainTypeId,
  };

  return (
    <ErrorBoundary error={error} pluginName="RiskAssessment">
      <SectionComponent {...updatedProps} />;
    </ErrorBoundary>
  );
}
export default Section;
