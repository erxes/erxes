import LoansResearchSidebar from '../components/LoansResearchSidebar';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import { useHasDetail } from '../utils';

type Props = {
  showType?: string;
};

const LoansResearchSidebarContainer = ({ showType }: Props) => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const { loansResearch, loading } = useHasDetail(queryParams?.itemId);

  if (loading) return <Spinner />;

  const updatedProps = {
    showType,
    queryParams,
    loansResearch,
  };
  return <LoansResearchSidebar {...updatedProps} />;
};

export default LoansResearchSidebarContainer;
