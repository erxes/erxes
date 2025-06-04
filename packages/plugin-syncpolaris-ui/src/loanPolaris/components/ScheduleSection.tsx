import { Box, Table } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';

import { ContractsTableWrapper, ScrollTableColls } from '../styles';
import Icon from '@erxes/ui/src/components/Icon';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import Alert from '@erxes/ui/src/utils/Alert';
import { IContractDoc } from '../types';

type Props = {
  contract: IContractDoc;
  reSendSchedules: (data: any) => void;
};

function ScheduleSection({ contract, reSendSchedules }: Props) {
  const onSendSchedules = () =>
    confirm(__('Are you sure Send Schedules?'))
      .then(() => reSendSchedules(contract))
      .catch((error) => {
        Alert.error(error.message);
      });

  const renderExtraButton = () => {
    return (
      <button onClick={onSendSchedules} title="send schedule">
        <Icon icon="refresh-1" />
      </button>
    );
  };

  return (
    <Box
      title={__('Sync Schedules')}
      name="showPolaris"
      isOpen={true}
      extraButtons={renderExtraButton()}
    >
      <ScrollTableColls>
        <ContractsTableWrapper>
          <Table>
            <thead>
              <tr>
                <th>{__('Is Sync Schedule')}</th>
              </tr>
            </thead>

            {contract.isSyncedSchedules && (
              <tbody id="schedules">
                <tr>
                  <td>{contract?.isSyncedSchedules && 'Synced Schedule'}</td>
                </tr>
              </tbody>
            )}
          </Table>
        </ContractsTableWrapper>
      </ScrollTableColls>
    </Box>
  );
}

export default ScheduleSection;
