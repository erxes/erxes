import * as React from 'react';
import AccquireInformation from '../components/AccquireInformation';
import { useAppContext } from './AppContext';

const AccquireInformationContainer: React.FC = () => {
  const { saveGetNotified, getColor, isSavingNotified, getUiOptions } =
    useAppContext();

  return (
    <AccquireInformation
      color={getColor()}
      textColor={getUiOptions().textColor || '#fff'}
      save={saveGetNotified}
      loading={isSavingNotified}
      showTitle={true}
    />
  );
};

export default AccquireInformationContainer;
