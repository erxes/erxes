import { gql, useQuery } from '@apollo/client';
import { queries } from './graphql';
import { DetailQueryResponse, ILoanResearch } from './types';
import { SectionBodyItem, renderFullName } from '@erxes/ui/src';
import React from 'react';
import { Link } from 'react-router-dom';

export const useHasDetail = (dealId: string) => {
  // First query: Check if deal has details
  const { data: dealData, loading: dealLoading } =
    useQuery<DetailQueryResponse>(gql(queries.loanResearchDetail), {
      variables: { dealId },
      skip: !dealId, // Ensures hook order remains consistent
    });

  const loansResearch = dealData?.loanResearchDetail as ILoanResearch;

  // Second query: If no deal details, fetch related customers
  const { data: customerData, loading: customerLoading } = useQuery(
    gql(queries.customers),
    {
      variables: {
        mainType: 'deal',
        mainTypeId: dealId || '',
        relType: 'customer',
        isSaved: true,
      },
      skip: !!loansResearch || !dealId, // Skip if loansResearch exists or dealId is missing
    }
  );

  const customerId = customerData?.customers?.[0]?._id;

  // Third query: If no deal details, fetch customer loan research
  const { data: customerLoanData, loading: customerLoanLoading } =
    useQuery<DetailQueryResponse>(gql(queries.loanResearchDetail), {
      variables: { customerId },
      skip: !!loansResearch || !customerId, // Skip if loansResearch exists or no customerId
    });

  return {
    loansResearch:
      loansResearch || (customerLoanData?.loanResearchDetail as ILoanResearch),
    loading: dealLoading || customerLoading || customerLoanLoading,
  };
};

export const renderBody = (obj: any, type?: string) => {
  if (!obj) {
    return null;
  }

  if (type === 'deal') {
    return (
      <div>
        <SectionBodyItem>{obj.name}</SectionBodyItem>
      </div>
    );
  }

  return (
    <div>
      <SectionBodyItem>
        <Link to={`/contacts/details/${obj._id}`}>{renderFullName(obj)}</Link>
      </SectionBodyItem>
    </div>
  );
};
