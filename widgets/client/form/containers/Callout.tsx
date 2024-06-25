import * as React from 'react';
import Callout from '../components/Callout';
import { useAppContext } from './AppContext';

const Container = () => {
  const { showForm, setHeight, getIntegrationConfigs } = useAppContext();

  const leadData = getIntegrationConfigs();
  const { callout, themeColor } = leadData;

  return (
    <Callout
      onSubmit={showForm}
      setHeight={setHeight}
      configs={callout || {}}
      color={themeColor || ''}
      hasTopBar={true}
    />
  );
};

export default Container;
