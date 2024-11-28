import { gql } from '@apollo/client';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';
import { Title } from '@erxes/ui-settings/src/styles';
import client from '@erxes/ui/src/apolloClient';
import {
  Button,
} from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import { __, confirm } from "@erxes/ui/src/utils";
import { isEnabled } from '@erxes/ui/src/utils/core';
import React, { useEffect, useState } from 'react';
import { queries } from '../graphql';
import { IConfigsMap } from '../types';
import SavingPerSettings from './SavingPerSettings';
import Sidebar from './SideBar';

const attrs = {
  slevel: { description: '' },
  capMethod: { description: '' },
  capAcntSysNo: { description: '' },
  custCode: { description: '' },
  segCode: { description: '' },
  jointOrSingle: { description: '' },
  statusCustom: { description: '' },
  statusDate: { description: '' },
  casaAcntCode: { description: '' },
  closedBy: { description: '' },
  closedDate: { description: '' },
  lastCtDate: { description: '' },
  lastDtDate: { description: '' },
}

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const SavingSettings = (props: Props) => {
  const [fieldGroups, setFieldGroups] = useState<IFieldGroup[]>([]);
  const [contractTypes, setContractType] = useState<any[]>([]);
  const [openKey, setOpenKey] = useState<string>('');
  const [savingMap, setSavingMap] = useState<any>(
    props.configsMap.POLARIS?.saving || {}
  )

  useEffect(() => {
    client
      .query({
        query: gql(fieldQueries.fieldsGroups),
        variables: {
          contentType: 'savings:contract',
        },
      })
      .then(({ data }) => {
        setFieldGroups(data ? data.fieldsGroups : [] || []);
      });
  }, []);

  useEffect(() => {
    if (isEnabled("savings")) {
      client
        .query({
          query: gql(queries.savingsContractTypes),
          variables: {
            isDeposit: false
          },
        })
        .then(({ data }) => {
          setContractType(data ? data.savingsContractTypes : [] || []);
        });
    }
  }, []);

  const saveChecker = (currentMap) => {
    const tempMap = {}
    const defaultKeys = Object.keys(attrs);
    for (const key of Object.keys(currentMap)) {
      const data = currentMap[key];
      if (defaultKeys.includes(key) || key === data.title) {
        tempMap[key] = data;
      } else {
        if (!data.title) {
          continue
        }
        tempMap[data.title] = data;
      }
    }
    return tempMap;
  }

  const save = (e) => {
    e.preventDefault();

    const mapValues = {};
    for (const contractTypeId of Object.keys(savingMap)) {
      mapValues[contractTypeId] = {
        ...savingMap[contractTypeId],
        values: saveChecker(savingMap[contractTypeId].values)
      }
    }
    setSavingMap({ ...mapValues })
    props.save({ POLARIS: { ...props.configsMap.POLARIS, saving: { ...mapValues } } });
  };

  const onAdd = () => {
    setSavingMap({ ...savingMap, [`newRule`]: { title: 'new Rule', value: {} } })
  }

  const onDelete = (id) => {
    confirm("This Action will delete this config are you sure?").then(() => {
      const tempMap = { ...savingMap };

      delete tempMap[id];

      setSavingMap({ ...tempMap })
    });
  }

  const onUpdate = (key: string, currentMap: IConfigsMap) => {
    setOpenKey(key);
    setSavingMap({ ...savingMap, [key]: { ...savingMap[key], values: { ...currentMap } } });
  }

  const onUpdateKey = (key: string, oldKey: string, title: string, currentMap: IConfigsMap) => {
    const tempMap = { ...savingMap };
    delete tempMap[oldKey];
    setOpenKey(key)
    setSavingMap({ ...tempMap, [key]: { contractTypeId: key, title, values: currentMap } });
  }

  const renderContent = () => {
    return (
      <>
        {Object.keys(savingMap).map(perMapKey => (
          <SavingPerSettings
            key={perMapKey}
            currentKey={perMapKey}
            configsMap={savingMap[perMapKey]}
            fieldGroups={fieldGroups}
            attrs={attrs}
            contractTypes={contractTypes}
            delete={onDelete}
            setCurrentMap={onUpdate}
            setContractType={onUpdateKey}
            isOpen={openKey === perMapKey}
          />
        ))}
      </>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Sync polaris config') },
  ];

  const actionButtons = (
    <>
      <Button
        onClick={onAdd}
        icon="add"
        uppercase={false}
      >
        Add Rule
      </Button>
      <Button
        btnStyle="success"
        onClick={save}
        icon="check-circle"
        uppercase={false}
      >
        Save
      </Button>
    </>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Sync polaris config')}
          breadcrumb={breadcrumb}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__('Sync polaris configs')}</Title>}
          right={actionButtons}
          background="colorWhite"
        />
      }
      leftSidebar={<Sidebar />}
      content={renderContent()}
      transparent={true}
      hasBorder={true}
    />
  );
}

export default SavingSettings;
