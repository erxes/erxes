import Button from 'modules/common/components/Button';
import { TopHeader } from 'modules/common/styles/main';
import { IRouterProps } from 'modules/common/types';
import React from 'react';
import { ClientPortalConfig } from '../types';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { FieldStyle, SidebarList } from 'modules/layout/styles';
import Spinner from 'modules/common/components/Spinner';
import { Link } from 'react-router-dom';
import { SidebarListItem } from 'modules/settings/styles';
import { StyledUrl } from '../styles';
import LoadMore from 'modules/common/components/LoadMore';
import EmptyState from 'modules/common/components/EmptyState';
import ClientPortalDetailContainer from '../containers/ClientPortalDetail';
import ModalTrigger from 'modules/common/components/ModalTrigger';

type Props = {
  configs: ClientPortalConfig[];
  totalCount: number;
  queryParams: any;
  loading: boolean;
} & IRouterProps;

const formUrl = '/settings/client-portal';

function ClientPortalList({
  configs,
  loading,
  totalCount,
  history,
  queryParams,
  ...props
}: Props) {
  const handleClick = () => history.push(formUrl);

  const renderRow = () => {
    return configs.map(config => {
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
        onClick={handleClick}
      >
        New Client Portal
      </Button>
    );

    const content = props => (
      <ClientPortalDetailContainer queryParams="" history={history} />
    );

    return (
      <TopHeader>
        <ModalTrigger
          size="lg"
          title="New Client Portal"
          trigger={addBrand}
          enforceFocus={true}
          content={content}
        />
      </TopHeader>
    );
  };

  return (
    <LeftSidebar wide={true} full={true} header={renderSidebarHeader()}>
      <SidebarList id={'BrandSidebar'}>
        {renderRow()}
        <LoadMore all={totalCount} loading={loading} />
      </SidebarList>
      {loading && <Spinner />}
      {!loading && totalCount === 0 && (
        <EmptyState image="/images/actions/18.svg" text="There is no brand" />
      )}
    </LeftSidebar>
  );
}

export default ClientPortalList;
