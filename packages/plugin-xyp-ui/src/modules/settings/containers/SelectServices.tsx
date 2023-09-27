import React from 'react';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import SelectServices from '../components/SelectServices';

const XYP_SERVICES_QUERY = gql`
  query xypServiceList($url: String, $token: String) {
    xypServiceList(url: $url, token: $token)
  }
`;

const Container = ({ onChange, value, url, token }) => {
  const { data, loading, error } = useQuery(XYP_SERVICES_QUERY, {
    variables: { url, token }
  });

  const onSearch = (searchValue: string) => {
    // getCategories({
    //   variables: {
    //     searchValue,
    //   },
    // });
  };

  const duplicatedOrgNames = data?.xypServiceList.map(d => d.orgName);
  const orgNames = [...new Set(duplicatedOrgNames)];
  const newList = orgNames.map(d => {
    const orgServices = data?.xypServiceList.filter(x => x.orgName === d);

    const _servicesKeyValue = orgServices.map(d => ({
      value: d.wsOperationName,
      label: `${d.wsOperationDetail} (хувилбар ${d.wsVersion})`
    }));
    return { label: d, options: _servicesKeyValue };
  });

  return (
    <SelectServices
      filtered={newList}
      value={value}
      loading={loading}
      onSearch={onSearch}
      onChange={onChange}
    />
  );
};

export default Container;
