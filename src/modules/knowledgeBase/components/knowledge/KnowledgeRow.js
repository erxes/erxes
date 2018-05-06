import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Icon, DropdownToggle, ModalTrigger } from 'modules/common/components';
import { CategoryList, KnowledgeForm, CategoryForm } from '../../containers';
import { DropIcon } from 'modules/common/styles/main';
import {
  KnowledgeBaseRow,
  SectionHead,
  SectionTitle,
  RowActions
} from './styles';

const propTypes = {
  queryParams: PropTypes.object.isRequired,
  currentCategoryId: PropTypes.string,
  topic: PropTypes.object.isRequired,
  articlesCount: PropTypes.number.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

class KnowledgeRow extends Component {
  constructor(props) {
    super(props);

    this.state = { detailed: this.isExpanded() };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({ detailed: !this.state.detailed });
  }

  isExpanded() {
    const { currentCategoryId, topic } = this.props;
    const categories = topic.categories || [];

    return categories.some(c => c['_id'] === currentCategoryId);
  }

  renderManage() {
    const { topic, save, remove } = this.props;
    const { __ } = this.context;
    const addCategory = <MenuItem>{__('Add category')}</MenuItem>;
    const manageTopic = <MenuItem>{__('Manage Knowledge Base')}</MenuItem>;

    return (
      <RowActions>
        <Dropdown id="dropdown-knowledgebase" pullRight>
          <DropdownToggle bsRole="toggle">
            <Icon icon="settings" />
          </DropdownToggle>
          <Dropdown.Menu>
            <ModalTrigger title="Manage Knowledge Base" trigger={manageTopic}>
              <KnowledgeForm save={save} topic={topic} remove={remove} />
            </ModalTrigger>
            <ModalTrigger title="Add Category" trigger={addCategory}>
              <CategoryForm topicIds={topic._id} />
            </ModalTrigger>
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

KnowledgeRow.propTypes = propTypes;
KnowledgeRow.contextTypes = contextTypes;

export default KnowledgeRow;
