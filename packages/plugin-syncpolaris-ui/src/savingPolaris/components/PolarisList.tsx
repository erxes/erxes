import { Table } from '@erxes/ui/src';

import { ContractsTableWrapper } from '../styles';
import React from 'react';
import { __ } from 'coreui/utils';
import { Tabs as MainTabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { IContractDoc } from '../types';

type IProps = {
  contract: IContractDoc;
  savingHistories: any[];
};

interface ITabItem {
  component: any;
  label: string;
}

interface ITabs {
  tabs: ITabItem[];
}

export function Tabs({ tabs }: ITabs) {
  const [tabIndex, setTabIndex] = React.useState(0);

  return (
    <>
      <MainTabs>
        {tabs.map((tab, index) => (
          <TabTitle
            className={tabIndex === index ? 'active' : ''}
            key={`tab${tab.label}`}
            onClick={() => setTabIndex(index)}
          >
            {tab.label}
          </TabTitle>
        ))}
      </MainTabs>

      <div style={{ width: '100%', marginTop: 20 }}>
        {tabs?.[tabIndex]?.component}
      </div>
    </>
  );
}

const PolarisList = (props: IProps) => {
  const { savingHistories, contract } = props;

  const renderRow = (saving) => {
    return (
      <tr key={saving._id}>
        <td>{saving.responseStr ? 'synced' : 'not synced'}</td>
        <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {saving?.responseStr || saving?.content}
        </td>
        <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {saving?.error || saving.responseStr}
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
            <th>{__('Contract Id')}</th>
            <th>{__('Message')}</th>
          </tr>
        </thead>

        <tbody id="saving">
          {(savingHistories || []).length > 0
            ? savingHistories.map((saving) => renderRow(saving))
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
