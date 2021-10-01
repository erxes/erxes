import Button from 'modules/common/components/Button';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Sidebar from 'modules/layout/components/Sidebar';
import DataWithLoader from 'modules/common/components/DataWithLoader';

import { TopHeader } from 'modules/common/styles/main';
import React from 'react';

import { ForumForm } from '../../containers/forums';
import ForumRow from './ForumRow';
import { IButtonMutateProps } from 'modules/common/types';

import { IForum } from '../../types';
import { __ } from 'modules/common/utils';

type Props = {
  forums: IForum[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (forumId: string, callback?: () => void) => void;
  currentTopicId: string;
  loading: boolean;
};

class ForumList extends React.Component<Props> {
  renderTopics() {
    const { forums, renderButton, remove, currentTopicId } = this.props;

    return (
      <>
        {forums.map((forum, index) => (
          <ForumRow
            key={index}
            forum={forum}
            renderButton={renderButton}
            remove={remove}
            currentTopicId={currentTopicId}
          />
        ))}
      </>
    );
  }

  renderSidebarHeader() {
    const trigger = (
      <Button
        btnStyle="success"
        block={true}
        uppercase={false}
        icon="plus-circle"
      >
        Add Forum
      </Button>
    );

    const content = props => (
      <ForumForm {...props} renderButton={this.props.renderButton} />
    );

    return (
      <TopHeader>
        <ModalTrigger
          title={__('Add Forum')}
          autoOpenKey="showForumAddModal"
          trigger={trigger}
          content={content}
          enforceFocus={false}
        />
      </TopHeader>
    );
  }

  render() {
    const { forums, loading } = this.props;

    return (
      <Sidebar full={true} wide={true} header={this.renderSidebarHeader()}>
        <DataWithLoader
          data={this.renderTopics()}
          loading={loading}
          count={forums.length}
          emptyText="There is no forum"
          emptyImage="/images/actions/18.svg"
        />
      </Sidebar>
    );
  }
}

export default ForumList;
