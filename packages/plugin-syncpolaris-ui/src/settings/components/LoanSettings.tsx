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
import LoanPerSettings from './LoanPerSettings';
import Sidebar from './SideBar';

const attrs = {
  prodType: { description: '' },
  isNotAutoClass: { description: '' },
  comRevolving: { description: '' },
  dailyBasisCode: { description: '' },
  impairmentPer: { description: '' },
  IsGetBrchFromOutside: { description: '' },
  segCode: { description: '' },
  status: { description: '' },
  slevel: { description: '' },
  classNoTrm: { description: '' },
  classNoQlt: { description: '' },
  classNo: { description: '' },
  termBasis: { description: '' },
  isBrowseAcntOtherCom: { description: '' },
  repayPriority: { description: '' },
  useSpclAcnt: { description: '' },
  notSendToCib: { description: '' },
  losMultiAcnt: { description: '' },
  validLosAcnt: { description: '' },
  secType: { description: '' },
}

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const LoanSettings = (props: Props) => {
  const [fieldGroups, setFieldGroups] = useState<IFieldGroup[]>([]);
  const [contractTypes, setContractType] = useState<any[]>([]);
  const [openKey, setOpenKey] = useState<string>('');
  const [loanMap, setLoanMap] = useState<any>(
    props.configsMap.POLARIS?.loan || {}
  )

  useEffect(() => {
    client
      .query({
        query: gql(fieldQueries.fieldsGroups),
        variables: {
          contentType: 'loans:contract',
        },
      })
      .then(({ data }) => {
        setFieldGroups(data ? data.fieldsGroups : [] || []);
      });
  }, []);

  useEffect(() => {
    if (isEnabled("loans")) {
      client
        .query({
          query: gql(queries.loansContractTypes),
          variables: {},
        })
        .then(({ data }) => {
          setContractType(data ? data.contractTypes : [] || []);
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
    for (const contractTypeId of Object.keys(loanMap)) {
      mapValues[contractTypeId] = {
        ...loanMap[contractTypeId],
        values: saveChecker(loanMap[contractTypeId].values)
      }
    }
    setLoanMap({ ...mapValues })
    props.save({ POLARIS: { ...props.configsMap.POLARIS, loan: { ...mapValues } } });
  };

  const onAdd = () => {
    setLoanMap({ ...loanMap, [`newRule`]: { title: 'new Rule', value: {} } })
  }

  const onDelete = (id) => {
    confirm("This Action will delete this config are you sure?").then(() => {
      const tempMap = { ...loanMap };

      delete tempMap[id];

      setLoanMap({ ...tempMap })
    });
  }

  const onUpdate = (key: string, currentMap: IConfigsMap) => {
    setOpenKey(key);
    setLoanMap({ ...loanMap, [key]: { ...loanMap[key], values: { ...currentMap } } });
  }

  const onUpdateKey = (key: string, oldKey: string, title: string, currentMap: IConfigsMap) => {
    const tempMap = { ...loanMap };
    delete tempMap[oldKey];
    setOpenKey(key)
    setLoanMap({ ...tempMap, [key]: { contractTypeId: key, title, values: currentMap } });
  }

  const renderContent = () => {
    return (
      <>
        {Object.keys(loanMap).map(perMapKey => (
          <LoanPerSettings
            key={perMapKey}
            currentKey={perMapKey}
            configsMap={loanMap[perMapKey]}
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

export default LoanSettings;
