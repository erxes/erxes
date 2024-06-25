import * as React from 'react';
import ShoutboxLauncher from '../components/ShoutboxLauncher';
import { useAppContext } from './AppContext';

const Container = () => {
  const { isFormVisible, toggleShoutbox, getIntegrationConfigs } =
    useAppContext();

  const leadData = getIntegrationConfigs();

  return (
    <ShoutboxLauncher
      isFormVisible={isFormVisible}
      onClick={toggleShoutbox}
      color={leadData.themeColor || ''}
    />
  );
};

export default Container;
