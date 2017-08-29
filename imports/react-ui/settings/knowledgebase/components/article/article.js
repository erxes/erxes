import React, { Component, PropTypes } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  ButtonToolbar,
  Modal,
} from 'react-bootstrap';

const propTypes = {
  item: PropTypes.object,
  save: PropTypes.func.isRequired,
};

class KbArticle extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      status: this.getCurrentStatus(),
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  getCurrentStatus() {
    const { item } = this.props;
    if (item == null) {
      return 'draft';
    }
    return item.status;
  }

  handleStatusChange(event) {
    // TODO: can be refactored by moving it inside render method
    this.setState({
      status: event.target.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    const { item } = this.props;

    let newValues = {
      title: document.getElementById('knowledgebase-article-title').value,
      summary: document.getElementById('knowledgebase-article-summary').value,
      content: document.getElementById('knowledgebase-article-content').value,
      status: this.state.status,
    };

    if (item && item._id) {
      newValues = {
        ...newValues,
        createdBy: item.createdBy,
        createdDate: item.createdDate,
        modifiedBy: item.modifiedBy,
        modifiedDate: item.modifiedDate,
      };
    }
    this.props.save(newValues);
    this.context.closeModal();
  }

  render() {
    let status = this.state.status;
    const { item = {} } = this.props;

    return (
      <form className="margined" onSubmit={this.handleSubmit}>
        <FormGroup controlId="knowledgebase-article-title">
          <ControlLabel>Title</ControlLabel>
          <FormControl type="text" defaultValue={item.title} required />
        </FormGroup>

        <FormGroup controlId="knowledgebase-article-summary">
          <ControlLabel>Summary</ControlLabel>
          <FormControl type="text" defaultValue={item.summary} />
        </FormGroup>

        <FormGroup controlId="knowledgebase-article-content">
          <ControlLabel>Content</ControlLabel>
          <FormControl type="text" defaultValue={item.content} />
        </FormGroup>

        <FormGroup controlId="knowledgebase-article-status">
          <ControlLabel>Status</ControlLabel>
          <FormControl
            componentClass="select"
            placeholder="select"
            onChange={this.handleStatusChange}
            value={status}
          >
            <option value="draft">Draft</option>
            <option value="publish">Publish</option>
          </FormControl>
        </FormGroup>

        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

KbArticle.propTypes = propTypes;

KbArticle.contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

export default KbArticle;
