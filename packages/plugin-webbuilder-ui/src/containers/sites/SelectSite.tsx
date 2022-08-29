import React from 'react';
import { queries } from '../../graphql';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Select from 'react-select-plus';
import * as compose from 'lodash.flowright';

import { IOption } from '@erxes/ui/src/types';
import { ISiteDoc, SitesQueryResponse } from '../../types';

type Props = {
  onSelect: (value: string) => void;
  initialValue?: string | string[];
};

type FinalProps = {
  sitesQuery: SitesQueryResponse;
} & Props;

const generateSiteOptions = (array: ISiteDoc[] = []): IOption[] => {
  return array.map(item => {
    const site = item || {};

    return {
      value: site._id,
      label: site.name
    };
  });
};

const SelectSite = (props: FinalProps) => {
  const { onSelect, initialValue, sitesQuery } = props;

  if (sitesQuery.loading) {
    return null;
  }

  const sites = sitesQuery.webbuilderSites || [];

  return (
    <Select
      value={initialValue}
      options={generateSiteOptions(sites)}
      onChange={option => (option ? onSelect(option.value) : onSelect(''))}
      multi={false}
      clearable={true}
      placeholder={'Select a site'}
    />
  );
};

export default compose(
  graphql(gql(queries.sites), {
    name: 'sitesQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  })
)(SelectSite);
