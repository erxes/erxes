import { Box, Table } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';

import { ContractsTableWrapper, ScrollTableColls } from '../../styles';
import { IContractDoc } from '../../types';

type Props = {
  savingHistories: any[];
};

function TransactionHistories({ savingHistories }: Props) {
  const renderRow = (saving) => {
    return (
      <tr key={saving._id}>
        <td>{saving?.responseStr ? 'synced' : 'not synced'}</td>
        <td>{saving?.responseData?.txnJrno || saving?.content}</td>
        <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {saving?.error || saving?.responseData?.txnJrno}
        </td>
      </tr>
    );
  };

  return (
    <Box title={__('Active Saving')} name="showPolaris" isOpen={true}>
      <ScrollTableColls>
        <ContractsTableWrapper>
          <Table>
            <thead>
              <tr>
                <th>{__('Date')}</th>
                <th>{__('Type')}</th>
                <th>{__('Message')}</th>
              </tr>
            </thead>

            <tbody>
              {(savingHistories || []).length > 0 &&
                (savingHistories || []).map((saving) => renderRow(saving))}
            </tbody>
          </Table>
        </ContractsTableWrapper>
      </ScrollTableColls>
    </Box>
  );
}

export default TransactionHistories;
