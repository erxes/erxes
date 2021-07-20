import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/inbox/containers/leftSidebar/Sidebar';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  queryParams?: any;
  currentUser: IUser;
};

function Empty({ queryParams, currentUser }: Props) {
  const menuInbox = [{ title: 'Team Inbox', link: '/inbox/index' }];

  const suggestContent = (
    <>
      <Link to="/settings/channels">
        <Button btnStyle="simple" icon="sitemap-1">
          {__('Manage Channels')}
        </Button>
      </Link>
      <Link to="/tutorial#usingStage?open=teamInbox">
        <Button icon="laptop-1">{__('Watch Tutorial')}</Button>
      </Link>
    </>
  );

  const content = (
    <EmptyState
      text="Whoops! No messages here but you can always start"
      size="full"
      image="/images/actions/12.svg"
      extra={suggestContent}
    />
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Team Inbox')}
          queryParams={queryParams}
          submenu={menuInbox}
        />
      }
      content={content}
      leftSidebar={<Sidebar queryParams={queryParams} />}
    />
  );
}

export default Empty;
