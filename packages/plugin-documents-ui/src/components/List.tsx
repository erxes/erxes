import Tip from '@erxes/ui/src/components/Tip';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import React from 'react';
import Table from '@erxes/ui/src/components/table';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import { SidebarListItem, Title } from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import Icon from '@erxes/ui/src/components/Icon';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';
import { Link } from 'react-router-dom';
import { removeParams } from '@erxes/ui/src/utils/router';

type Props = {
  queryParams: any;
  list: any[];
  contentTypes: { label: string; contentType: string; subTypes: string[] }[];
  history: any;
  remove: (_id: String) => void;
};

function List({ queryParams, contentTypes, list, remove, history }: Props) {
  const actionBarRight = () => {
    if (!queryParams.contentType) {
      return <></>;
    }

    return (
      <Button
        href={`/settings/documents/create?contentType=${queryParams.contentType}`}
        btnStyle="success"
        icon="plus-circle"
      >
        Add
      </Button>
    );
  };

  const title = <Title capitalize={true}>{__('Documents')}</Title>;

  const actionBar = (
    <Wrapper.ActionBar left={title} right={actionBarRight()} wideSpacing />
  );

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('name')}</th>
          <th>{__('Actions')}</th>
        </tr>
      </thead>
      <tbody>
        {list.map(obj => {
          return (
            <tr>
              <td>{obj.name}</td>
              <td>
                <ActionButtons>
                  <Tip text={__('Delete')} placement="top">
                    <Button
                      btnStyle="link"
                      onClick={remove.bind(this, obj._id)}
                      icon="times-circle"
                    />
                  </Tip>

                  <Button
                    btnStyle="link"
                    href={`/settings/documents/edit/${obj._id}`}
                  >
                    <Icon icon="edit-3" />
                  </Button>
                </ActionButtons>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Documents'), link: '/settings/documents' }
  ];

  const clearParams = () => {
    removeParams(history, 'contentType');
  };

  const sidebar = (
    <LeftSidebar header={<SidebarHeader />} hasBorder>
      <LeftSidebar.Header uppercase={true}>
        {__('Document type')}
        {queryParams.contentType && (
          <Button icon="cancel-1" btnStyle="link" onClick={clearParams} />
        )}
      </LeftSidebar.Header>
      <SidebarList noTextColor noBackground id={'DocumentsSidebar'}>
        {contentTypes.map(({ label, contentType }) => (
          <SidebarListItem
            key={contentType}
            isActive={queryParams?.contentType === contentType}
          >
            <Link to={`/settings/documents/?contentType=${contentType}`}>
              {__(label)}
            </Link>
          </SidebarListItem>
        ))}
      </SidebarList>
    </LeftSidebar>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Documents')} breadcrumb={breadcrumb} />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={false}
          count={list.length}
          emptyText={__('There is no document') + '.'}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={sidebar}
      transparent={true}
      hasBorder
    />
  );
}

export default List;
