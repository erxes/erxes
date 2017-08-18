import React, { Component, PropTypes } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  ButtonToolbar,
  Modal,
} from 'react-bootstrap';

class KbArticle extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      status: this.getCurrentStatus(),
    };
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
    console.log('event.target.value: ', event.target.value);
    this.setState({
      status: event.target.value,
    });
  }

  render() {
    let status = this.state.status;
    const item = this.props.item || {};

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

  handleSubmit(e) {
    e.preventDefault();

    this.context.closeModal();

    this.props.save({
      title: document.getElementById('knowledgebase-article-title').value,
      summary: document.getElementById('knowledgebase-article-summary').value,
      content: document.getElementById('knowledgebase-article-content').value,
      status: this.state.status,
    });
  }
}

KbArticle.propTypes = {
  ...KbArticle.propTypes,
};

KbArticle.contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

export default KbArticle;
