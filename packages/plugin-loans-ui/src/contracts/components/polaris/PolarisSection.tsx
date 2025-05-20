import { Box } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';

import { ScrollTableColls } from '../../styles';
import withConsumer from '../../../withConsumer';
import Icon from '@erxes/ui/src/components/Icon';
import { IUser } from '@erxes/ui/src/auth/types';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import Alert from '@erxes/ui/src/utils/Alert';
import { IContractDoc } from '../../types';
import PolarisContainer from '../../containers/Polaris';

type Props = {
  contract: IContractDoc;
  currentUser: IUser;
  reSendContract: (data: any) => void;
};

function PolarisSection({ contract, reSendContract }: Props) {
  const onSendPolaris = () =>
    confirm(__('Are you sure Send Loan polaris?'))
      .then(() => reSendContract(contract))
      .catch((error) => {
        Alert.error(error.message);
      });

  const renderExtraButton = () => {
    return (
      <button onClick={onSendPolaris} title="send contract">
        <Icon icon="refresh-1" />
      </button>
    );
  };

  return (
    <Box
      title={__('Loan & Polaris')}
      name="showPolaris"
      isOpen={true}
      extraButtons={renderExtraButton()}
    >
      <ScrollTableColls>
        <PolarisContainer contract={contract}></PolarisContainer>
      </ScrollTableColls>
    </Box>
  );
}

export default withConsumer(PolarisSection);
