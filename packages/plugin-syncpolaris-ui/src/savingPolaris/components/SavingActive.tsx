import { Box } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';
import { Table } from '@erxes/ui/src';

import { ContractsTableWrapper } from '../styles';
import { ScrollTableColls } from '../styles';
import Icon from '@erxes/ui/src/components/Icon';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import Alert from '@erxes/ui/src/utils/Alert';
import { IContractDoc } from '../types';

type Props = {
  contract: IContractDoc;
  savingHistories: any[];
  savingActive: (contractNumber: string) => void;
  depositActive: (contractNumber: string) => void;
};

function SavingActive({
  contract,
  savingHistories,
  savingActive,
  depositActive
}: Props) {
  const onHandlePolaris = () =>
    confirm(__('Are you sure you want to activate Savings?'))
      .then(() => {
        if (contract.isDeposit) {
          return depositActive(contract.number);
        } else {
          return savingActive(contract.number);
        }
      })
      .catch((error) => {
        Alert.error(error.message);
      });

  const renderExtraButton = () => {
    return (
      !contract.isActiveSaving && (
        <button onClick={onHandlePolaris} title="active contract">
          <Icon icon="refresh-1" />
        </button>
      )
    );
  };

  const renderRow = (saving) => {
    return (
      <tr key={saving._id}>
        <td>{saving?.responseData ? 'synced' : 'not synced'}</td>
        <td>{saving?.responseData || saving?.content}</td>
        <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {saving?.error || saving?.responseData}
        </td>
      </tr>
    );
  };

  return (
    <Box
      title={__('Active Saving')}
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
                <th>{__('Polaris Contract Id')}</th>
                <th>{__('Message')}</th>
              </tr>
            </thead>

            <tbody>
              {(savingHistories || []).length > 0
                ? (savingHistories || []).map((saving) => renderRow(saving))
                : contract.isActiveSaving && (
                    <tr>
                      <td>{contract?.isActiveSaving && 'Activated Saving'}</td>
                      <td>{contract?.number || ''}</td>
                      <td>{''}</td>
                    </tr>
                  )}
            </tbody>
          </Table>
        </ContractsTableWrapper>
      </ScrollTableColls>
    </Box>
  );
}

export default SavingActive;
