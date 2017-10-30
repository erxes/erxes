import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Well
} from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { Button } from 'modules/common/components';
import Sidebar from '../../Sidebar';

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

    // this.props.save(this.state.signatures, error => {
    //   if (error) return Alert.error(error.reason);
    //
    //   return Alert.success('Congrats');
    // });
  }

  render() {
    const current = this.getCurrent();

    const content = (
      <div className="margined">
        <Well>
          Signatures are only included in response emails. <br />
          You can use Markdown to format your signature.
        </Well>

        <form id="signature-form" onSubmit={this.handleSubmit}>
          <FormGroup onChange={this.changeCurrent} controlId="selectBrand">
            <ControlLabel>Brand</ControlLabel>

            <FormControl componentClass="select">
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
          <ButtonToolbar className="pull-right">
            <Button btnStyle="success" type="submit">
              Save
            </Button>
          </ButtonToolbar>
        </form>
      </div>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/channels' },
      { title: 'Signature template' }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<Sidebar />}
        content={content}
      />
    );
  }
}

Signature.propTypes = propTypes;

export default Signature;
