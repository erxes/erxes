import React, { PropTypes, Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  ButtonToolbar,
  Modal,
} from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import SelectBrand from '../SelectBrand';

class KbTopic extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      copied: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    const item = this.props.item || {};
    const { brands } = this.props;

    return (
      <form className="margined" onSubmit={this.handleSubmit}>
        <FormGroup controlId="knowledgebase-title">
          <ControlLabel>Title</ControlLabel>
          <FormControl type="text" defaultValue={item.title} required />
        </FormGroup>

        <FormGroup controlId="knowledgebase-description">
          <ControlLabel>Description</ControlLabel>
          <FormControl type="text" defaultValue={item.description} />
        </FormGroup>

        <SelectBrand brands={brands} defaultValue={item.brandId} />

        <FormGroup controlId="install-code">
          <ControlLabel>Install code</ControlLabel>
          <div className="markdown-wrapper">
            <ReactMarkdown source={this.state.code} />
            {this.state.code
              ? <CopyToClipboard
                  text={this.state.code}
                  onCopy={() => this.setState({ copied: true })}
                >
                  <Button bsSize="small" bsStyle="primary">
                    {this.state.copied ? 'Copied' : 'Copy to clipboard'}
                  </Button>
                </CopyToClipboard>
              : null}
          </div>
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
      title: document.getElementById('knowledgebase-title').value,
      description: document.getElementById('knowledgebase-description').value,
      brandId: document.getElementById('selectBrand').value,
    });
  }
}

KbTopic.propTypes = {
  brands: PropTypes.array.isRequired, // eslint-disable-line
  save: PropTypes.func.isRequired,
};

KbTopic.contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

export default KbTopic;
