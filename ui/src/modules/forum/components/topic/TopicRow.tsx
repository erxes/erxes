import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { ActionButtons, TopicItem, TopicTitle } from './styles';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { TopicForm } from '../../containers/topic';

import { ITopic } from '../../types';

type Props = {
  topic: ITopic;
  isActive: boolean;
};

class TopicRow extends React.Component<Props> {
  private size;

  /* remove = () => {
    const { remove, topic } = this.props;
    remove(category._id);
  }; */

  renderEditForm(props) {
    return <TopicForm {...props} />;
  }

  renderEditAction = () => {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );
    const content = props => {
      return this.renderEditForm({ ...props });
    };

    return (
      <ModalTrigger
        size={this.size}
        title="Edit"
        trigger={editTrigger}
        content={content}
      />
    );
  };

  render() {
    const { topic, isActive } = this.props;

    return (
      <TopicItem isActive={isActive}>
        <Link to={`?id=${topic._id}`}>
          <TopicTitle isChild={true}>{topic.title}</TopicTitle>
          <span>({topic.discussions.length})</span>
        </Link>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text={__('Delete')} placement="bottom">
            <Button
              btnStyle="link"
              /* onClick={this.remove} */ icon="cancel-1"
            />
          </Tip>
        </ActionButtons>
      </TopicItem>
    );
  }
}

export default TopicRow;
