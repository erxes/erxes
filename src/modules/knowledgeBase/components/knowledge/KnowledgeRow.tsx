import { DropdownToggle, Icon, ModalTrigger } from 'modules/common/components';
import { DropIcon } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { CategoryForm, CategoryList, KnowledgeForm } from '../../containers';
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

  save: (
    params: {
      doc: {
        doc: {
          title: string;
          description: string;
          brandId: string;
          languageCode: string;
          color: string;
        };
      };
    },
    callback: () => void,
    object: any
  ) => void;
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
    const { topic, save, remove, refetchTopics } = this.props;

    const addCategory = <MenuItem>{__('Add category')}</MenuItem>;
    const manageTopic = <MenuItem>{__('Manage Knowledge Base')}</MenuItem>;

    const content = props => (
      <KnowledgeForm {...props} save={save} topic={topic} remove={remove} />
    );

    const categoryContent = props => (
      <CategoryForm
        {...props}
        topicIds={topic._id}
        refetchTopics={refetchTopics}
      />
    );

    return (
      <RowActions>
        <Dropdown id="dropdown-knowledgebase" pullRight={true}>
          <DropdownToggle bsRole="toggle">
            <Icon icon="settings" />
          </DropdownToggle>
          <Dropdown.Menu>
            <ModalTrigger
              title="Manage Knowledge Base"
              trigger={manageTopic}
              content={content}
            />
            <ModalTrigger
              title="Add Category"
              trigger={addCategory}
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
            topicIds={topic._id}
            queryParams={queryParams}
          />
        )}
      </KnowledgeBaseRow>
    );
  }
}

export default KnowledgeRow;
