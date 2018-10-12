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
  remove: (_id: string) => void;

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

class KnowledgeRow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { detailed: false };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({ detailed: !this.state.detailed });
  }

  isExpanded(currentCategoryId, topic) {
    const categories = topic.categories || [];

    return categories.some(c => c._id === currentCategoryId);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      detailed: this.isExpanded(nextProps.currentCategoryId, nextProps.topic)
    });
  }

  renderManage() {
    const { topic, save, remove } = this.props;

    const addCategory = <MenuItem>{__('Add category')}</MenuItem>;
    const manageTopic = <MenuItem>{__('Manage Knowledge Base')}</MenuItem>;

    return (
      <RowActions>
        <Dropdown id="dropdown-knowledgebase" pullRight>
          <DropdownToggle bsRole="toggle">
            <Icon icon="settings" />
          </DropdownToggle>
          <Dropdown.Menu>
            <ModalTrigger
              title="Manage Knowledge Base"
              trigger={manageTopic}
              content={props => (
                <KnowledgeForm
                  {...props}
                  save={save}
                  topic={topic}
                  remove={remove}
                />
              )}
            />
            <ModalTrigger
              title="Add Category"
              trigger={addCategory}
              content={props => (
                <CategoryForm {...props} topicIds={topic._id} />
              )}
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
            {topic.title}
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
