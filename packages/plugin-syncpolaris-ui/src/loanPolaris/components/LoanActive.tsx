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
  savingHistories: any[];
  activeLoan: (contractNumber: string) => void;
};

function LoanActive({ contract, savingHistories, activeLoan }: Props) {
  const onActive = () =>
    confirm(__('Are you sure Active Loan?'))
      .then(() => activeLoan(contract.number))
      .catch((error) => {
        Alert.error(error.message);
      });

  const renderExtraButton = () => {
    return (
      !contract.isActiveLoan && (
        <button onClick={onActive} title="active loan">
          <Icon icon="refresh-1" />
        </button>
      )
    );
  };

  const renderRow = (loan) => {
    return (
      <tr key={loan._id}>
        <td>{loan?.responseData ? 'synced' : 'not synced'}</td>
        <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {loan?.error || loan?.responseData}
        </td>
      </tr>
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
                <th>{__('Message')}</th>
              </tr>
            </thead>

            <tbody id="loanActive">
              {(savingHistories || []).length > 0
                ? (savingHistories || []).map((loan) => renderRow(loan))
                : contract.isActiveLoan && (
                    <tr>
                      <td>{contract?.isActiveLoan && 'Activated Loan'}</td>
                      <td>{contract?.number}</td>
                    </tr>
                  )}
            </tbody>
          </Table>
        </ContractsTableWrapper>
      </ScrollTableColls>
    </Box>
  );
}

export default LoanActive;
