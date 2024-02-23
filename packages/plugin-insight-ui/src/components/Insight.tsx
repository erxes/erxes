import React, { useRef, useState } from 'react';

import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

import Sidebar from './Sidebar';

type Props = {
  history: any;
  queryParams: any;
  component: any;
  loading: boolean;
};

const Insight = (props: Props) => {
  const { queryParams, history, component, loading } = props;

  const renderContent = () => {
    const Component = component;

    return (
      <Component
        queryParams={queryParams}
        history={history}
        loading={loading}
      />
    );
  };

  return (
    <>
      <Wrapper
        hasBorder
        header={
          <Wrapper.Header title="Insight" breadcrumb={[{ title: 'Insight' }]} />
        }
        leftSidebar={<Sidebar queryParams={queryParams} history={history} />}
        content={renderContent()}
      />
    </>
  );
};

export default Insight;
