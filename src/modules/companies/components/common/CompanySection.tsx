import GetConformity from 'modules/conformity/containers/GetConformity';
import React from 'react';
import { queries } from '../../graphql';
import CompaniesSection from './CompaniesSection';

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  isOpen?: boolean;
};

export default (props: IProps) => {
  return (
    <GetConformity
      {...props}
      relType={'company'}
      component={CompaniesSection}
      queryName={'companies'}
      itemsQuery={queries.companies}
      data={{}}
    />
  );
};
