import Button from 'modules/common/components/Button';
import Tip from 'modules/common/components/Tip';
import EmptyState from 'modules/common/components/EmptyState';
import LoadMore from 'modules/common/components/LoadMore';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Spinner from 'modules/common/components/Spinner';
import { TopHeader } from 'modules/common/styles/main';
import { IRouterProps } from 'modules/common/types';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { FieldStyle, SidebarList } from 'modules/layout/styles';
import { SidebarListItem, ActionButtons } from 'modules/settings/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import ClientPortalDetailContainer from '../containers/ClientPortalDetail';
import { StyledUrl } from '../styles';
import { ClientPortalConfig } from '../types';
import { __ } from 'modules/common/utils';

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
    <LeftSidebar wide={true} full={true} header={renderSidebarHeader()}>
      <SidebarList id={'ClientPortalSidebar'}>
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
