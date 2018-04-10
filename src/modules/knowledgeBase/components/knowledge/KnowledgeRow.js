import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Icon, DropdownToggle, ModalTrigger } from 'modules/common/components';
import { CategoryList, KnowledgeForm, CategoryForm } from '../../containers';
import {
  SidebarContent,
  SectionHead,
  SectionTitle,
  RowRightSide,
  DropIcon
} from '../../styles';

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

    this.state = { detailed: false };
    this.toggle = this.toggle.bind(this);
    this.renderKnowledgeBaseForm = this.renderKnowledgeBaseForm.bind(this);
  }

  renderKnowledgeBaseForm(props) {
    return <KnowledgeForm {...props} />;
  }

  toggle() {
    this.setState({ detailed: !this.state.detailed });
  }

  render() {
    const {
      topic,
      save,
      remove,
      currentCategoryId,
      queryParams,
      articlesCount
    } = this.props;
    const { __ } = this.context;
    const addCategory = <MenuItem>{__('Add category')}</MenuItem>;
    const manageTopic = <MenuItem>{__('Manage Knowledge Base')}</MenuItem>;

    return (
      <SidebarContent key={topic._id}>
        <SectionHead>
          <SectionTitle onClick={this.toggle}>{topic.title}</SectionTitle>
          <RowRightSide>
            <Dropdown
              id="dropdown-knowledgebase"
              className="quick-button"
              pullRight
            >
              <DropdownToggle bsRole="toggle">
                <Icon icon="gear-a" />
              </DropdownToggle>
              <Dropdown.Menu>
                <ModalTrigger
                  title="Manage Knowledge Base"
                  trigger={manageTopic}
                >
                  {this.renderKnowledgeBaseForm({ save, topic, remove })}
                </ModalTrigger>
                <ModalTrigger title="Add Category" trigger={addCategory}>
                  <CategoryForm topicIds={topic._id} />
                </ModalTrigger>
              </Dropdown.Menu>
            </Dropdown>
            <DropIcon onClick={this.toggle} isOpen={this.state.detailed} />
          </RowRightSide>
        </SectionHead>
        {this.state.detailed && (
          <CategoryList
            currentCategoryId={currentCategoryId}
            articlesCount={articlesCount}
            topicIds={topic._id}
            queryParams={queryParams}
          />
        )}
      </SidebarContent>
    );
  }
}

KnowledgeRow.propTypes = propTypes;
KnowledgeRow.contextTypes = contextTypes;

export default KnowledgeRow;
