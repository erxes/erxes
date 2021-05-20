import React from 'react';
import {
  ForumRow as ForumsRow,
  SectionHead,
  SectionTitle,
  RowActions
} from './styles';
import { IForum } from '../../types';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import { IButtonMutateProps } from 'modules/common/types';

import ModalTrigger from 'modules/common/components/ModalTrigger';
import { DropIcon } from 'modules/common/styles/main';
import Icon from 'modules/common/components/Icon';

import { ForumForm } from '../../containers/forum';

type Props = {
  forum: IForum;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (forumId: string) => void;
};

type State = {
  detailed: boolean;
};

const STORAGE_KEY = `erxes_forum_accordion`;

const collapse = (id: string, click?: boolean, isCurrent?: boolean) => {
  const data = localStorage.getItem(STORAGE_KEY);
  let values: string[] = [];

  if (data) {
    values = JSON.parse(data);
  }

  if (click) {
    values.includes(id)
      ? (values = values.filter(key => key !== id))
      : values.push(id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }

  return isCurrent ? true : values.includes(id);
};

class ForumRow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { detailed: collapse(props.forum._id) };
  }

  toggle = () => {
    const { forum } = this.props;

    this.setState({ detailed: collapse(forum._id, true) });
  };

  renderManage() {
    const { forum, renderButton, remove } = this.props;

    //  const addCategory = <Dropdown.Item>{__('Add category')}</Dropdown.Item>;

    const manageTopic = <Dropdown.Item>{'Edit Forum'}</Dropdown.Item>;

    const content = props => (
      <ForumForm
        {...props}
        renderButton={renderButton}
        forum={forum}
        remove={remove}
      />
    );

    /* const categoryContent = props => (
      <CategoryForm
        {...props}
        topicId={topic._id}
        refetchTopics={refetchTopics}
      />
    ); */

    return (
      <RowActions>
        <Dropdown alignRight={true} style={{ float: 'left' }}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-knowledgebase">
            <Icon icon="cog" size={15} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <ModalTrigger
              title="Manage Knowledge Base"
              trigger={manageTopic}
              content={content}
              enforceFocus={false}
              size="lg"
            />
            {/* <ModalTrigger
              title="Add Category"
              trigger={addCategory}
              autoOpenKey="showKBAddCategoryModal"
              content={categoryContent}
            /> */}
          </Dropdown.Menu>
        </Dropdown>
        <DropIcon onClick={this.toggle} isOpen={this.state.detailed} />
      </RowActions>
    );
  }

  render() {
    const { forum } = this.props;

    return (
      <ForumsRow>
        <SectionHead>
          <SectionTitle>
            {forum.title} ({24})<span>{forum.description}</span>
          </SectionTitle>
          {this.renderManage()}
        </SectionHead>
      </ForumsRow>
    );
  }
}

export default ForumRow;
