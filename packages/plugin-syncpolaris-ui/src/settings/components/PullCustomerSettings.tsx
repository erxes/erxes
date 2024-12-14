import { gql } from '@apollo/client';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';
import { Row, Title } from '@erxes/ui-settings/src/styles';
import client from '@erxes/ui/src/apolloClient';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
} from '@erxes/ui/src/components';
import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import { Wrapper } from '@erxes/ui/src/layout';
import { FormColumn } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import React, { useEffect, useState } from 'react';
import { SYNC_TYPES } from '../../constants';
import { ContentBox } from '../../styles';
import { IConfigsMap } from '../types';
import PullCustomerExtra from './PullCustomerExtra';
import Sidebar from './SideBar';

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
        setFieldGroups(data?.fieldsGroups || []);
      });
  }, []);

  const save = (e) => {
    e.preventDefault();
    const tempMap: any[] = []
    for (const item of currentMap) {
      if (!item.extra) {
        tempMap.push({ ...item, extra: {} })
        continue
      }

      const extra = {}
      for (const extraKey of Object.keys(item.extra)) {
        const value = item.extra[extraKey];
        if (value?.respKey) {
          extra[value.respKey] = value
        }
      }
      tempMap.push({ ...item, extra })
    }
    props.save({ PULL_POLARIS: tempMap });
  };

  const onAdd = () => {
    setCurrentMap([...currentMap, { _id: Math.random().toString(), contentType: 'customer', kind: 'load', extra: {} }])
  }

  const onDelete = (id) => {
    setCurrentMap([...currentMap.filter(c => c._id !== id)])
  }

  const renderItem = (item) => {
    const setValue = (key, value) => {
      setCurrentMap([...currentMap.map(
        c => c._id === item._id && { ...item, [key]: value } || { ...c }
      )]);
    }

    const changeCode = (e) => {
      const code = e.target.value;
      const title = SYNC_TYPES.find(st => st.code === code)?.title
      setCurrentMap([...currentMap.map(
        c => c._id === item._id && { ...item, code, title } || { ...c }
      )]);
    }

    const onAddExtra = () => {
      setCurrentMap([...currentMap.map(
        c => c._id === item._id && {
          ...item,
          extra: {
            ...(item.extra || {}),
            [Math.random().toString()]: {
              respKey: '',
              groupId: '',
              fieldId: '',
              propType: '',
            }
          }
        } || { ...c }
      )]);
    }

    const editExtra = (values) => {
      setValue('extra', values)
    }

    return (
      <FormGroup key={item._id}>
        <Row>
          <FormColumn maxwidth='60%'>
            <FormControl
              name="code"
              componentclass="select"
              options={SYNC_TYPES.map(st => ({ value: st.code, label: `${st.code} - ${st.title}` }))}
              value={item.code}
              onChange={(e) => changeCode(e)}
            />
          </FormColumn>
          <FormColumn maxwidth='35%'>
            <FormControl
              name="kind"
              componentclass="select"
              options={[
                { value: 'load', label: 'component load' },
                { value: 'click', label: 'event click' },
              ]}
              value={item.kind}
              onChange={(e) => setValue('kind', (e.target as any).value)}
            />
          </FormColumn>
          <FormColumn maxwidth='5%'>
            <ActionButtons>
              <Button btnStyle="link" icon="times-circle" onClick={onDelete.bind(this, item._id)} />
              <Button btnStyle="link" icon="add" onClick={onAddExtra.bind(this)} />
            </ActionButtons>
          </FormColumn>
        </Row>
        <PullCustomerExtra fieldGroups={fieldGroups} item={{ ...item, extra: item.extra || {} }} editExtra={editExtra} />
      </FormGroup >
    );
  }

  const renderContent = () => {
    return (
      <ContentBox id={'PolarisCustomerSettingsMenu'}>
        <FormGroup>
          <Row>
            <FormColumn maxwidth='60%'>
              <ControlLabel>Pull code</ControlLabel>
            </FormColumn>
            <FormColumn maxwidth='35%'>
              <ControlLabel>Pull type</ControlLabel>
            </FormColumn>
            <FormColumn maxwidth='5%'>
              <ControlLabel>Actions</ControlLabel>
            </FormColumn>
          </Row>
        </FormGroup >
        {
          currentMap.map(item => renderItem(item))
        }
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
