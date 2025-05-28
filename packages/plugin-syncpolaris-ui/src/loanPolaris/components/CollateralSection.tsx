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
  reSendCollateral: (data: any) => void;
};

function CollateralSection({
  contract,
  savingHistories,
  reSendCollateral
}: Props) {
  const onSendCollateral = () =>
    confirm(__('Are you sure Send Collateral?'))
      .then(() => reSendCollateral(contract))
      .catch((error) => {
        Alert.error(error.message);
      });

  const renderExtraButton = () => {
    return (
      <button onClick={onSendCollateral} title="send collateral">
        <Icon icon="refresh-1" />
      </button>
    );
  };

  const renderRow = (loan) => {
    return (
      <tr key={loan._id}>
        <td>{loan?.responseStr ? 'synced' : 'not synced'}</td>
        <td>{loan?.responseStr || loan?.content}</td>
        <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {loan?.error || loan?.responseStr}
        </td>
      </tr>
    );
  };

  return (
    <Box
      title={__('Sync Collateral')}
      name="showPolaris"
      isOpen={true}
      extraButtons={renderExtraButton()}
    >
      <ScrollTableColls>
        <ContractsTableWrapper>
          <Table>
            <thead>
              <tr>
                <th>{__('Is Sync Collateral')}</th>
                <th>{__('Is Sync Collateral')}</th>
                <th>{__('Message')}</th>
              </tr>
            </thead>

            <tbody id="loan">
              {(savingHistories || []).length > 0
                ? savingHistories.map((loan) => renderRow(loan))
                : contract.isSyncedCollateral && (
                    <tr>
                      <td>{'Synced Collateral'}</td>
                      <td>
                        {contract?.collateralsData?.[0]?.certificate || ''}
                      </td>
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

export default CollateralSection;
