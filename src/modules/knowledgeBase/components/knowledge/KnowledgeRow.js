import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Icon, DropdownToggle, ModalTrigger } from 'modules/common/components';
import { CategoryForm } from '../category';
import { CategoryList, KnowledgeForm } from '../../containers';
import {
  SidebarContent,
  SectionHead,
  SectionTitle,
  Categories,
  RowRightSide
} from '../../styles';

const propTypes = {
  queryParams: PropTypes.object.isRequired,
  currentCategoryId: PropTypes.string,
  topic: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired
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
    const { topic, save, remove, currentCategoryId, queryParams } = this.props;

    const addCategory = <MenuItem>Add category</MenuItem>;

    const manageTopic = <MenuItem>Manage Knowledge Base</MenuItem>;

    return (
      <SidebarContent key={topic._id}>
        <SectionHead>
          <SectionTitle onClick={this.toggle}>{topic.title}</SectionTitle>
          <RowRightSide className={this.state.detailed}>
            40
            <Dropdown id="dropdown-user" className="quick-button" pullRight>
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
                  <CategoryForm />
                </ModalTrigger>
              </Dropdown.Menu>
            </Dropdown>
          </RowRightSide>
        </SectionHead>
        {this.state.detailed && (
          <Categories>
            <CategoryList
              currentCategoryId={currentCategoryId}
              currentTopicId={topic._id}
              queryParams={queryParams}
            />
          </Categories>
        )}
      </SidebarContent>
    );
  }
}

KnowledgeRow.propTypes = propTypes;

export default KnowledgeRow;
