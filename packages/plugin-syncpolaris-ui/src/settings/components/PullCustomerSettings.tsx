import { gql } from '@apollo/client';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';
import { Row, Title } from '@erxes/ui-settings/src/styles';
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
import React, { useEffect, useState } from 'react';
import { ContentBox } from '../../styles';
import { IConfigsMap } from '../types';
import Sidebar from './SideBar';
import { SYNC_TYPES } from '../../constants';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const PullCustomerSettings = (props: Props) => {
  const [fieldGroups, setFieldGroups] = useState<IFieldGroup[]>([]);
  const [currentMap, setCurrentMap] = useState<any[]>(
    props.configsMap.PULL_POLARIS || []
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
    props.save({ PULL_POLARIS: currentMap });
  };

  const onAdd = () => {
    setCurrentMap([...currentMap, { _id: Math.random().toString(), contentType: 'customer', kind: 'load' }])
  }

  const onDelete = (id) => {
    setCurrentMap([...currentMap.filter(c => c._id !== id)])
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
        <FormColumn maxwidth='30%'>
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
        </FormColumn>
        <FormColumn maxwidth='30%'>
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
        </FormColumn>
      </>
    );
  };

  const renderPerExtra = (curr) => {
    if (curr.kind === 'prop') {
      return <Row>
        <FormColumn maxwidth='5%'></FormColumn>
        <FormColumn maxwidth='25%'>
          {renderInput('key')}
        </FormColumn>
        {renderFields('key')}
        <FormColumn maxwidth='10%'>
          {renderInput('key')}
        </FormColumn>
      </Row>
    }

    return <></>;
  }

  const renderItem = (curr) => {
    const setValue = (key, value) => {
      setCurrentMap([...currentMap.map(
        c => c._id === curr._id && { ...curr, [key]: value } || { ...c }
      )]);
    }

    return (
      <FormGroup key={curr._id}>
        <Row>
          <FormColumn maxwidth='20%'>
            <FormControl
              name="code"
              componentclass="select"
              options={SYNC_TYPES.map(st => ({ value: st.code, label: st.code }))}
              value={curr.code}
              onChange={(e) => setValue('code', (e.target as any).value)}
            />
          </FormColumn>
          <FormColumn maxwidth='40%'>
            <FormControl
              name="title"
              componentclass="select"
              options={SYNC_TYPES.map(st => ({ value: st.code, label: st.title }))}
              value={curr.code}
              disabled={true}
            />
          </FormColumn>
          <FormColumn maxwidth='30%'>
            <FormControl
              name="kind"
              componentclass="select"
              options={[
                { value: 'load', label: 'component load' },
                { value: 'click', label: 'event click' },
                { value: 'prop', label: 'property save' },
                { value: 'history', label: 'history save' },
              ]}
              value={curr.kind}
              onChange={(e) => setValue('kind', (e.target as any).value)}
            />
          </FormColumn>
          <FormColumn maxwidth='10%'>
            <Button btnStyle="link" icon="times-circle" onClick={onDelete.bind(this, curr._id)} />
          </FormColumn>
        </Row>
        {renderPerExtra(curr)}
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
            currentMap.map(curr => renderItem(curr))
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
        onClick={onAdd}
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

export default PullCustomerSettings;
