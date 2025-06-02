import { Box } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';
import { Table } from '@erxes/ui/src';

import { ContractsTableWrapper } from '../../styles';
import { ScrollTableColls } from '../../styles';
import { IContractDoc } from '../../types';

type Props = {
  contract: IContractDoc;
  savingHistories: any[];
};

function TransactionHistories({ savingHistories }: Props) {
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

  //  : contract.isActiveSaving && (
  //                   <tr>
  //                     <td>{contract?.isActiveSaving && 'Activated Saving'}</td>
  //                     <td>{contract?.number || ''}</td>
  //                     <td>{''}</td>
  //                   </tr>
  //                 )

  return (
    <Box title={__('Active Saving')} name="showPolaris" isOpen={true}>
      <ScrollTableColls>
        <ContractsTableWrapper>
          <Table>
            <thead>
              <tr>
                <th>{__('Date')}</th>
                <th>{__('Type')}</th>
                <th>{__('Saving Balance')}</th>
                <th>{__('Amount')}</th>
                <th>{__('Stored Interest')}</th>
                <th>{__('Total')}</th>
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
