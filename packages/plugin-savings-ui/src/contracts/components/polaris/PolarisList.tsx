import { Table } from '@erxes/ui/src';

import { ContractsTableWrapper } from '../../styles';
import React from 'react';
import { __ } from 'coreui/utils';
import { IContractDoc } from '../../types';

interface IProps {
  contract: IContractDoc;
}

const PolarisList = (props: IProps) => {
  const { contract } = props;

  return (
    <ContractsTableWrapper>
      <Table>
        <thead>
          <tr>
            <th>{__('Is Synced Polaris')}</th>
            <th>{__('Polaris Contract Id')}</th>
            <th>{__('Contract Type')}</th>
            <th>{__('Saving Amount')}</th>
          </tr>
        </thead>

        {contract.isSyncedPolaris ? (
          <tbody id="schedules">
            <td>{contract?.isSyncedPolaris && 'Synced'}</td>
            <td>{contract?.number || ''}</td>
            <td>{contract?.contractType?.name || ''}</td>
            <td>{contract?.savingAmount || 0}</td>{' '}
          </tbody>
        ) : (
          ''
        )}
      </Table>
    </ContractsTableWrapper>
  );
};

export default PolarisList;
