import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  ControlLabel,
  Button,
  FormGroup,
  FormControl,
  Icon
} from 'modules/common/components';
import Sidebar from '../../Sidebar';
import { ContentBox, SubHeading, Well } from '../../styles';

const propTypes = {
  signatures: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired
};

class Signature extends Component {
  constructor(props) {
    super(props);

    this.changeCurrent = this.changeCurrent.bind(this);
    this.changeContent = this.changeContent.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      signatures: props.signatures,
      currentId: null
    };
  }

  getCurrent() {
    const currentId = this.state.currentId;

    if (!currentId) {
      return {};
    }

    return this.state.signatures.find(
      signature => signature.brandId.toString() === currentId.toString()
    );
  }

  changeCurrent(e) {
    this.setState({ currentId: e.target.value });
  }

  changeContent(e) {
    const current = this.getCurrent();

    current.content = e.target.value;

    this.setState({ signatures: this.state.signatures });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save(this.state.signatures);
  }

  render() {
    const current = this.getCurrent() || {};

    const content = (
      <ContentBox>
        <SubHeading>Email signatures</SubHeading>
        <Well>
          Signatures are only included in response emails. <br />
          You can use Markdown to format your signature.
        </Well>

        <form id="signature-form" onSubmit={this.handleSubmit}>
          <FormGroup>
            <ControlLabel>Brand</ControlLabel>

            <FormControl
              componentClass="select"
              onChange={this.changeCurrent}
              controlId="selectBrand"
            >
              <option>------------</option>

              {this.props.signatures.map(signature => (
                <option key={signature.brandId} value={signature.brandId}>
                  {signature.brandName}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Signature</ControlLabel>

            <FormControl
              componentClass="textarea"
              id="content"
              rows={6}
              onChange={this.changeContent}
              value={current.content}
            />
          </FormGroup>
        </form>
      </ContentBox>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/channels' },
      { title: 'Signature template' }
    ];

    const actionFooter = (
      <Wrapper.ActionBar
        right={
          <Button btnStyle="success" onClick={this.handleSubmit}>
            <Icon icon="checkmark" /> Save
          </Button>
        }
      />
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        footer={actionFooter}
        content={content}
      />
    );
  }
}

Signature.propTypes = propTypes;

export default Signature;
