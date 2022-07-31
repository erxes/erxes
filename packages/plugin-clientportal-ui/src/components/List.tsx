import { ActionButtons, SidebarListItem } from '@erxes/ui-settings/src/styles';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import LoadMore from '@erxes/ui/src/components/LoadMore';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Spinner from '@erxes/ui/src/components/Spinner';
import Tip from '@erxes/ui/src/components/Tip';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { FieldStyle, SidebarList } from '@erxes/ui/src/layout/styles';
import { TopHeader } from '@erxes/ui/src/styles/main';
import { IRouterProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { Link } from 'react-router-dom';

import ClientPortalDetailContainer from '../containers/ClientPortalDetail';
import { StyledUrl } from '../styles';
import { ClientPortalConfig } from '../types';

type Props = {
  configs: ClientPortalConfig[];
  remove: (_id?: string) => void;
  totalCount: number;
  queryParams: any;
  loading: boolean;
} & IRouterProps;

function ClientPortalList({
  configs,
  remove,
  loading,
  totalCount,
  history,
  queryParams
}: Props) {
  const renderRow = () => {
    return configs.map(config => {
      const onRemove = () => {
        remove(config._id);
      };

      return (
        <SidebarListItem
          key={config._id}
          isActive={queryParams._id === config._id}
        >
          <Link to={`?_id=${config._id}`}>
            <FieldStyle>
              {config.name}
              <StyledUrl>{config.url}</StyledUrl>
            </FieldStyle>
          </Link>
          <ActionButtons>
            <Tip text={__('Delete')} placement="bottom">
              <Button btnStyle="link" onClick={onRemove} icon="cancel-1" />
            </Tip>
          </ActionButtons>
        </SidebarListItem>
      );
    });
  };

  const renderSidebarHeader = () => {
    const addBrand = (
      <Button
        btnStyle="success"
        block={true}
        uppercase={false}
        icon="plus-circle"
      >
        Add New Client Portal
      </Button>
    );

    const content = props => (
      <ClientPortalDetailContainer
        {...props}
        queryParams=""
        history={history}
      />
    );

    return (
      <TopHeader>
        <ModalTrigger
          size="xl"
          title="New Client Portal"
          trigger={addBrand}
          enforceFocus={false}
          content={content}
        />
      </TopHeader>
    );
  };

  return (
    <LeftSidebar
      noMargin
      wide={true}
      header={renderSidebarHeader()}
      hasBorder={true}
    >
      <SidebarList noTextColor noBackground id={'ClientPortalSidebar'}>
        {renderRow()}
        <LoadMore all={totalCount} loading={loading} />
      </SidebarList>
      {loading && <Spinner />}
      {!loading && totalCount === 0 && (
        <EmptyState
          image="/images/actions/18.svg"
          text="There is no client portal"
        />
      )}
    </LeftSidebar>
  );
}

export default ClientPortalList;
