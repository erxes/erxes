import * as React from 'react';
import AccquireInformation from '../components/AccquireInformation';
import { getColor, getUiOptions } from '../utils/util';
import { useConversation } from '../context/Conversation';

const AccquireInformationContainer = ({ loading }: { loading: boolean }) => {
  const { saveGetNotified, isSavingNotified } = useConversation();

  return (
    <AccquireInformation
      color={getColor()}
      textColor={getUiOptions().textColor || '#fff'}
      save={saveGetNotified}
      loading={isSavingNotified || loading}
      showTitle={true}
    />
  );
};
export default AccquireInformationContainer;
