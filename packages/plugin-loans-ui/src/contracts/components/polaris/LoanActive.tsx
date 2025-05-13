import { Box, Table } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';

import { ContractsTableWrapper, ScrollTableColls } from '../../styles';
import Icon from '@erxes/ui/src/components/Icon';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import Alert from '@erxes/ui/src/utils/Alert';
import { IContractDoc } from '../../types';

type Props = {
  contract: IContractDoc;
  activeLoan: (contractNumber: string) => void;
};

function LoanActive({ contract, activeLoan }: Props) {
  const onSendSchedules = () =>
    confirm(__('Are you sure Active Loan?'))
      .then(() => activeLoan(contract.number))
      .catch((error) => {
        Alert.error(error.message);
      });

  const renderExtraButton = () => {
    return (
      <button onClick={onSendSchedules} title="active loan">
        <Icon icon="refresh-1" />
      </button>
    );
  };

  return (
    <Box
      title={__('Active loan')}
      name="showPolaris"
      isOpen={true}
      extraButtons={renderExtraButton()}
    >
      <ScrollTableColls>
        <ContractsTableWrapper>
          <Table>
            <thead>
              <tr>
                <th>{__('Is Active Contract')}</th>
                <th>{__('Polaris Contract number')}</th>
              </tr>
            </thead>

            {contract.isActiveLoan ? (
              <tbody id="schedules">
                <tr>
                  <td>{contract?.isActiveLoan && 'Activated Loan'}</td>
                  <td>{contract?.number && 'Activated Loan'}</td>
                </tr>
              </tbody>
            ) : (
              ''
            )}
          </Table>
        </ContractsTableWrapper>
      </ScrollTableColls>
    </Box>
  );
}

export default LoanActive;
