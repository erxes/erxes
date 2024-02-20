import React, { useRef, useState } from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Sidebar from './Sidebar';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import RTG from 'react-transition-group';
import { RightDrawerContainer } from '../styles';
import Form from './Form';

type Props = {
  history: any;
  queryParams: any;
  component: any;
};

const Insight = (props: Props) => {
  const { queryParams, history, component } = props;

  const renderContent = () => {
    const Component = component;

    return <Component queryParams={queryParams} history={history} />;
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
