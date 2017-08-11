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
  }

  render() {
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
