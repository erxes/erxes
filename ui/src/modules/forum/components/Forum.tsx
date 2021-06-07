import Wrapper from 'modules/layout/components/Wrapper';
import Button from 'modules/common/components/Button';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import { __ } from 'modules/common/utils';
import { Title } from 'modules/common/styles/main';
import React from 'react';

import { ForumList } from '../containers/forums';
import { ITopic } from '../types';
import { DiscussionList, DiscussionForm } from '../containers/discussion';

type Props = {
  currentTopic: ITopic;
  queryParams: any;
  discussionsCount: number;
};

class Forum extends React.Component<Props> {
  breadcrumb() {
    const currentTopic = this.props.currentTopic || {
      title: ''
    };

    const list = [{ title: 'Forum', link: '/forum' }];
    const topicLink = `/forum?id=${currentTopic._id}`;

    if (currentTopic.title) {
      list.push({
        title: currentTopic.title,
        link: topicLink
      });
    }

    return list;
  }

  render() {
    const { queryParams, currentTopic, discussionsCount } = this.props;

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add Discussion
      </Button>
    );

    const content = props => (
      <DiscussionForm
        {...props}
        queryParams={queryParams}
        currentTopicId={currentTopic._id}
        forumId={currentTopic.forumId}
      />
    );

    const actionBarLeft = currentTopic._id && (
      <ModalTrigger
        title="Add Discussion"
        trigger={trigger}
        size="lg"
        autoOpenKey="showForumAddDiscussionModal"
        content={content}
        enforceFocus={false}
      />
    );

    const leftActionBar = (
      <Title>
        {currentTopic.title}
        <span>
          ({discussionsCount}{' '}
          {discussionsCount > 1 ? __('discussions') : __('discussion')})
        </span>
      </Title>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${currentTopic.title || ''}`}
            breadcrumb={this.breadcrumb()}
          />
        }
        leftSidebar={
          <ForumList
            currentTopicId={currentTopic._id}
            queryParams={queryParams}
          />
        }
        actionBar={
          <Wrapper.ActionBar left={leftActionBar} right={actionBarLeft} />
        }
        footer={currentTopic._id && <Pagination count={discussionsCount} />}
        transparent={true}
        content={
          <DiscussionList
            queryParams={queryParams}
            currentTopicId={currentTopic._id}
            forumId={currentTopic.forumId}
          />
        }
      />
    );
  }
}

export default Forum;
