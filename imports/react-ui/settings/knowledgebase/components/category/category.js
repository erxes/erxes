import React, { Component, PropTypes } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  ButtonToolbar,
  Modal,
} from 'react-bootstrap';
import SelectTopic from '../SelectTopic';

class KbCategory extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    const item = this.props.item || {};
    const { topics } = this.props;

    return (
      <form className="margined" onSubmit={this.handleSubmit}>
        <FormGroup controlId="knowledgebase-category-title">
          <ControlLabel>Title</ControlLabel>
          <FormControl type="text" defaultValue={item.title} required />
        </FormGroup>

        <FormGroup controlId="knowledgebase-category-description">
          <ControlLabel>Description</ControlLabel>
          <FormControl type="text" defaultValue={item.description} />
        </FormGroup>

        <SelectTopic topics={topics} defaultValue={item.topicId} />

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }

  handleSubmit(e) {
    e.preventDefault();

    this.context.closeModal();

    this.props.save({
      title: document.getElementById('knowledgebase-category-title').value,
      description: document.getElementById('knowledgebase-category-description').value,
      topicId: document.getElementById('selectTopic').value,
    });
  }
}

KbCategory.propTypes = {
  ...KbCategory.propTypes,
  topics: PropTypes.array.isRequired, // eslint-disable-line
};

KbCategory.contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

export default KbCategory;
