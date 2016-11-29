import React, { PropTypes } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  ButtonToolbar,
  Well,
} from 'react-bootstrap';
import { _ } from 'meteor/underscore';
import Alert from 'meteor/erxes-notifier';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from '../../Sidebar.jsx';


const propTypes = {
  signatures: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
};

export class Signature extends React.Component {
  constructor(props) {
    super(props);

    this.changeCurrent = this.changeCurrent.bind(this);
    this.changeContent = this.changeContent.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      signatures: props.signatures,
      currentId: null,
    };
  }

  getCurrent() {
    const currentId = this.state.currentId;

    if (!currentId) {
      return {};
    }

    return _.find(this.state.signatures, (signature) =>
      signature.brandId.toString() === currentId.toString()
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

    this.props.save(this.state.signatures, (error) => {
      if (error) return Alert.error(error.reason);

      return Alert.success('Congrats');
    });
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

              {this.props.signatures.map(signature =>
                <option key={signature.brandId} value={signature.brandId}>
                  {signature.brandName}
                </option>
              )}
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
            <Button type="submit" bsStyle="primary">Save</Button>
          </ButtonToolbar>
        </form>
      </div>
    );

    const breadcrumb = [
      { title: 'Settings', link: '/settings/channels' },
      { title: 'Signature template' },
    ];

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={breadcrumb} />}
          leftSidebar={<Sidebar />}
          content={content}
        />
      </div>
    );
  }
}

Signature.propTypes = propTypes;

export default Signature;
