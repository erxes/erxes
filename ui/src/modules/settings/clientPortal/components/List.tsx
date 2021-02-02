import HeaderDescription from 'erxes-ui/lib/components/HeaderDescription';
import Icon from 'erxes-ui/lib/components/Icon';
import { __ } from 'erxes-ui/lib/utils/core';
import ActionButtons from 'modules/common/components/ActionButtons';
import Button from 'modules/common/components/Button';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import Tip from 'modules/common/components/Tip';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { ClientPortalConfig } from '../types';

type Props = {
  configs: ClientPortalConfig[];
  totalCount: number;
  history: any;
};

const leftActionBar = (
  <HeaderDescription
    icon="/images/actions/23.svg"
    title="Client Portals"
    description="Client portal desc"
  />
);

const formUrl = '/settings/client-portal/form';

function ClientPortalList({ configs, ...props }: Props) {
  const handleClick = () => {
    props.history.push(formUrl);
  };

  const renderRow = () => {
    return configs.map(config => {
      return (
        <tr key={config._id}>
          <td>{config.name}</td>
          <td>{config.url}</td>
          <td>
            <ActionButtons>
              <a href={`${formUrl}?_id=${config._id}`}>
                <Tip text={__('Edit')} placement="top">
                  <Icon icon="edit-3" />
                </Tip>
              </a>
            </ActionButtons>
          </td>
        </tr>
      );
    });
  };

  const renderContent = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Url')}</th>
            <th style={{ width: 120 }}>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{renderRow()}</tbody>
      </Table>
    );
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title="Client portals"
          breadcrumb={[
            { title: __('Settings'), link: 'settings' },
            { title: __('Client Portals') }
          ]}
        />
      }
      actionBar={
        <Wrapper.ActionBar
          left={leftActionBar}
          right={
            <Button
              btnStyle="success"
              icon="plus-circle"
              uppercase={false}
              onClick={handleClick}
            >
              New Client Portal
            </Button>
          }
        />
      }
      footer={<Pagination count={props.totalCount} />}
      center={true}
      content={renderContent()}
    />
  );
}

export default ClientPortalList;
