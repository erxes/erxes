import GetConformity from 'modules/conformity/containers/GetConformity';
import React from 'react';
import { queries } from '../../graphql';
import { ICompany } from '../../types';
import CompaniesSection from './CompaniesSection';

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  isOpen?: boolean;
  onSelect?: (datas: ICompany[]) => void;
};

export default (props: IProps) => {
  return (
    <GetConformity
      {...props}
      relType="company"
      component={CompaniesSection}
      queryName="companies"
      itemsQuery={queries.companies}
    />
  );
};
