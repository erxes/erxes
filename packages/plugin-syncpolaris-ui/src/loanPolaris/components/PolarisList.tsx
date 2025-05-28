import { Table } from '@erxes/ui/src';

import { ContractsTableWrapper } from '../styles';
import React from 'react';
import { __ } from 'coreui/utils';
import { IContractDoc } from '../types';

interface IProps {
  contract: IContractDoc;
  savingHistories: any[];
}

const PolarisList = (props: IProps) => {
  const { contract, savingHistories } = props;

  const renderRow = (loan) => {
    return (
      <tr key={loan._id}>
        <td>{loan?.responseData ? 'synced' : 'not synced'}</td>
        <td>{loan?.responseData || loan?.content}</td>
        <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {loan?.error || loan?.responseData}
        </td>
      </tr>
    );
  };

  return (
    <ContractsTableWrapper>
      <Table>
        <thead>
          <tr>
            <th>{__('Is Synced Polaris')}</th>
            <th>{__('Polaris Contract Id')}</th>
            <th>{__('Message')}</th>
          </tr>
        </thead>

        <tbody id="loan">
          {(savingHistories || []).length > 0
            ? savingHistories.map((loan) => renderRow(loan))
            : contract.isSyncedPolaris && (
                <tr>
                  <td>{'Synced'}</td>
                  <td>{contract?.number || ''}</td>
                  <td>{contract?.contractType?.name || ''}</td>
                </tr>
              )}
        </tbody>
      </Table>
    </ContractsTableWrapper>
  );
};

export default PolarisList;
