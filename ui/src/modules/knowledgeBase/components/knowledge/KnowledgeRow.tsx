import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { DropIcon } from 'modules/common/styles/main';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import CategoryForm from '../../containers/category/CategoryForm';
import CategoryList from '../../containers/category/CategoryList';
import KnowledgeForm from '../../containers/knowledge/KnowledgeForm';
import { ITopic } from '../../types';
import {
  KnowledgeBaseRow,
  RowActions,
  SectionHead,
  SectionTitle
} from './styles';

type Props = {
  queryParams: any;
  currentCategoryId: string;
  topic: ITopic;
  articlesCount: number;
  remove: (knowledgeBaseId: string) => void;
  refetchTopics: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  detailed: boolean;
};

const STORAGE_KEY = `erxes_knowledgebase_accordion`;

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

class KnowledgeRow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { detailed: collapse(props.topic._id) };
  }

  toggle = () => {
    const { topic } = this.props;

    this.setState({ detailed: collapse(topic._id, true) });
  };

  componentWillReceiveProps(nextProps) {
    const { categories } = this.props.topic;

    if (categories.includes(nextProps.currentCategoryId)) {
      this.setState({ detailed: collapse('', false, true) });
    }
  }

  renderManage() {
    const { topic, renderButton, remove, refetchTopics } = this.props;

    const addCategory = <Dropdown.Item>{__('Add category')}</Dropdown.Item>;
    const manageTopic = (
      <Dropdown.Item>{__('Edit Knowledge Base')}</Dropdown.Item>
    );

    const content = props => (
      <KnowledgeForm
        {...props}
        renderButton={renderButton}
        topic={topic}
        remove={remove}
      />
    );

    const categoryContent = props => (
      <CategoryForm
        {...props}
        topicId={topic._id}
        refetchTopics={refetchTopics}
      />
    );

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
            <ModalTrigger
              title="Add Category"
              trigger={addCategory}
              autoOpenKey="showKBAddCategoryModal"
              content={categoryContent}
            />
          </Dropdown.Menu>
        </Dropdown>
        <DropIcon onClick={this.toggle} isOpen={this.state.detailed} />
      </RowActions>
    );
  }

  render() {
    const { topic, currentCategoryId, queryParams, articlesCount } = this.props;

    return (
      <KnowledgeBaseRow key={topic._id}>
        <SectionHead>
          <SectionTitle onClick={this.toggle}>
            {topic.title} ({topic.categories.length})
            <span>{topic.description}</span>
          </SectionTitle>
          {this.renderManage()}
        </SectionHead>
        {this.state.detailed && (
          <CategoryList
            currentCategoryId={currentCategoryId}
            articlesCount={articlesCount}
            topicId={topic._id}
            queryParams={queryParams}
          />
        )}
      </KnowledgeBaseRow>
    );
  }
}

export default KnowledgeRow;
