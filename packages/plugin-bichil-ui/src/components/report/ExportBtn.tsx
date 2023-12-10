import React from 'react';
import { getEnv } from '@erxes/ui/src/utils/core';
import queryString from 'query-string';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  queryParams: any;
  isCurrentUserAdmin: boolean;
  reportType: string;
};

export default (props: Props) => {
  const exportReport = () => {
    const stringified = queryString.stringify({
      ...props
    });

    const { REACT_APP_API_URL } = getEnv();
    window.open(
      `${REACT_APP_API_URL}/pl:bichil/bichil-report-export?${stringified}`
    );
  };

  return <Button onClick={exportReport}>Export</Button>;
};
