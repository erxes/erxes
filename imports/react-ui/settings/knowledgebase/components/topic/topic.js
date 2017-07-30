import React, { Component } from 'react';
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
    console.log('props: ', props);
    super(props, context);

    this.state = {
      copied: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    const group = this.props.group || {};

    return (
      <form className="margined" onSubmit={this.handleSubmit}>
        <FormGroup controlId="knowledgebase-title">
          <ControlLabel>Name</ControlLabel>
          <FormControl type="text" defaultValue={group.title} required />
        </FormGroup>

        <SelectBrand brands={this.props.brands} defaultValue={group.brandId} />

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

    // this.context.closeModal(); // TODO

    this.props.save({
      title: document.getElementById('knowledgebase-title').value,
      brandId: document.getElementById('selectBrand').value,
    });
  }
}

export default KbTopic;
