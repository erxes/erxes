import React, { useRef, useState } from 'react';

import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

import Sidebar from './Sidebar';

type Props = {
  queryParams: any;
  component: any;
  loading: boolean;
};

const Insight = (props: Props) => {
  const { queryParams, component, loading } = props;

  const renderContent = () => {
    const Component = component;

    return (
      <Component
        queryParams={queryParams}
        loading={loading}
      />
    );
  };

  return (
      <Wrapper
        hasBorder
        header={
          <Wrapper.Header title="Insight" breadcrumb={[{ title: 'Insight' }]} />
        }
        leftSidebar={<Sidebar queryParams={queryParams} />}
        content={renderContent()}
    />
  );
};

export default Insight;
