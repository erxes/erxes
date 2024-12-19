import { gql } from '@apollo/client';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';
import { ActionButtons, Row, Title } from '@erxes/ui-settings/src/styles';
import client from '@erxes/ui/src/apolloClient';
import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
} from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import { FormColumn } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React, { useEffect, useState } from 'react';
import { ContentBox } from '../../styles';
import { IConfigsMap } from '../types';
import Sidebar from './SideBar';

const attrs = {
  custSegCode: { label: 'custSegCode', description: '' },
  isVatPayer: { label: 'isVatPayer', description: '' },
  sexCode: { label: 'sexCode', description: '' },
  status: { label: 'status', description: '' },
  isCompanyCustomer: { label: 'isCompanyCustomer', description: '' },
  industryId: { label: 'industryId', description: '' },
  familyName: { label: 'familyName', description: '' },
  lastName: { label: 'lastName', description: '' },
  firstName: { label: 'firstName', description: '' },
  registerMaskCode: { label: 'registerMaskCode', description: '' },
  registerCode: { label: 'registerCode', description: '' },
  birthDate: { label: 'birthDate', description: '' },
  mobile: { label: 'mobile', description: '' },
  countryCode: { label: 'countryCode', description: '' },
  email: { label: 'email', description: '' },
  phone: { label: 'phone', description: '' },
  taxExemption: { label: 'taxExemption', description: '' },
  maritalStatus: { label: 'maritalStatus', description: '' },
}

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const GeneralSettings = (props: Props) => {
  const [fieldGroups, setFieldGroups] = useState<IFieldGroup[]>([]);
  const [currentMap, setCurrentMap] = useState<any>(
    props.configsMap.POLARIS?.customer || {}
  )

  useEffect(() => {
    client
      .query({
        query: gql(fieldQueries.fieldsGroups),
        variables: {
          contentType: 'core:customer',
        },
      })
      .then(({ data }) => {
        setFieldGroups(data ? data.fieldsGroups : [] || []);
      });
  }, []);

  const save = (e) => {
    e.preventDefault();
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
    props.save({ POLARIS: { ...props.configsMap.POLARIS, customer: tempMap } });
  };

  const addAttr = () => {
    setCurrentMap({ ...currentMap, [`newItem-${Math.random().toString()}`]: { title: '' } })
  }

  const attrDelete = (key) => {
    const tempMap = { ...currentMap };
    delete tempMap[key];
    setCurrentMap({ ...tempMap })
  }

  const renderInput = (key: string) => {
    const onChangeInput = (value) => {
      setCurrentMap({ ...currentMap, [key]: { ...currentMap[key] || {}, value } })
    };

    return (
      <FormControl
        value={currentMap[key]?.value}
        onChange={(e) => onChangeInput((e.target as any).value)}
      />
    );
  };

  const renderFields = (key: string) => {
    const setFieldGroup = (value) => {
      setCurrentMap({ ...currentMap, [key]: { ...currentMap[key] || {}, groupId: value } })
    }

    const setFormField = (value) => {
      const currentFields = ((fieldGroups || []).find(
        (fg) => fg._id === currentMap[key]?.groupId
      ) || {}).fields;
      const field = currentFields?.find(cf => cf._id === value);
      let propType: string | undefined = undefined

      if (field?.isDefinedByErxes) {
        propType = field.type;
      }

      setCurrentMap({ ...currentMap, [key]: { ...currentMap[key] || {}, fieldId: value, propType } })
    }

    return (
      <>
        <FormGroup>
          <FormControl
            name="fieldGroup"
            componentclass="select"
            options={[
              { value: "", label: "Empty" },
              ...(fieldGroups || []).map((fg) => ({
                value: fg._id,
                label: `${fg.code} - ${fg.name}`,
              })),
            ]}
            value={currentMap[key]?.groupId}
            onChange={(e) => setFieldGroup((e.target as any).value)}
          />

          <FormControl
            name="formField"
            componentclass="select"
            options={[
              { value: "", label: "Empty" },
              ...(
                (
                  (
                    (fieldGroups || []).find(
                      (fg) => fg._id === currentMap[key]?.groupId
                    ) || {}
                  ).fields || []
                ) || []
              ).map((f) => ({
                value: f._id,
                label: `${f.code} - ${f.text}`,
              })),
            ]}
            value={currentMap[key]?.fieldId}
            onChange={(e) => setFormField((e.target as any).value)}
          />
        </FormGroup>
      </>
    );
  };

  const renderItem = (key: string, label: string, description?: string) => {
    const setType = (value) => {
      setCurrentMap({ ...currentMap, [key]: { ...currentMap[key] || {}, type: value } })
    }

    const setKey = (value) => {
      setCurrentMap({ ...currentMap, [key]: { ...currentMap[key] || {}, title: value, label: value } })
    }

    const type = currentMap[key]?.type || 'str';
    const isDefault = Object.keys(attrs).includes(key);

    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <Row>
          <FormColumn maxwidth='10%'>
            <FormControl
              name="fieldGroup"
              componentclass="select"
              options={[
                { value: "", label: "Any" },
                { value: "form", label: "Form Fields" },
              ]}
              value={currentMap[key]?.type}
              onChange={(e) => setType((e.target as any).value)}
            />
          </FormColumn>
          <FormColumn maxwidth='15%'>
            <FormControl
              name="fieldGroup"
              value={isDefault ? key : currentMap[key].title}
              disabled={isDefault}
              onChange={(e) => setKey((e.target as any).value)}
            />
          </FormColumn>
          <FormColumn>
            {
              type === 'form' ?
                (renderFields(key)) :
                (renderInput(key))
            }
          </FormColumn>
          {!isDefault && <Button btnStyle="link" icon="times-circle" onClick={attrDelete.bind(this, key)} />}
        </Row>
      </FormGroup >
    );
  }

  const renderContent = () => {
    return (
      <ContentBox id={'PolarisCustomerSettingsMenu'}>
        <CollapseContent
          title="Customer data config"
          beforeTitle={<Icon icon="settings" />}
          transparent={true}
          open={true}
        >
          {
            Array.from(new Set(Object.keys({ ...attrs, ...currentMap }))).map(key => {
              const data = { ...currentMap[key] || {}, ...attrs[key] || {} }
              return renderItem(key, data?.label || key, data?.description);
            })
          }
        </CollapseContent>
      </ContentBox>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Sync polaris config') },
  ];

  const actionButtons = (
    <>
      <Button
        onClick={addAttr}
        icon="add"
        uppercase={false}
      >
        Add
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

export default GeneralSettings;
