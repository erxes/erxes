import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Button,
  Icon,
  FormControl,
  FormGroup,
  ControlLabel
} from 'modules/common/components';

const propTypes = {
  datas: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
  type: PropTypes.string
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class CommonMerge extends React.Component {
  constructor(props) {
    super(props);
    const { type } = this.props;

    if (type === 'company') {
      this.basicInfos = {
        name: 'Company Name',
        size: 'Company Size',
        website: 'Company Website',
        industry: 'Company Industry',
        plant: 'Company Plan'
      };
    }
    this.basicInfos = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'E-mail',
      phone: 'Phone'
    };
    this.state = {};

    this.onChange = this.onChange.bind(this);
    this.save = this.save.bind(this);
  }

  renderOptions(fieldName) {
    const { datas } = this.props;

    return datas.map(data => {
      return <option key={data._id}>{data[fieldName] || ''}</option>;
    });
  }

  renderField(field) {
    const wrapper = [];

    for (var key in field) {
      if (field.hasOwnProperty(key)) {
        wrapper.push(
          <FormGroup key={key}>
            <ControlLabel>{field[key]}</ControlLabel>
            <FormControl
              componentClass="select"
              name={key}
              onChange={e => this.onChange(e)}
            >
              {this.renderOptions(key)}
            </FormControl>
          </FormGroup>
        );
      }
    }

    return wrapper;
  }

  onChange(e) {
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      [name]: value
    });
    console.log(this.state);
  }

  save() {
    const customer = this.state;
    const { datas } = this.props;

    this.props.save(datas, customer);
  }

  render() {
    return (
      <div>
        {this.renderField(this.basicInfos)}
        <Modal.Footer>
          <Button btnStyle="simple" onClick={() => this.context.closeModal()}>
            <Icon icon="close" />CANCEL
          </Button>
          <Button btnStyle="success">
            <Icon icon="checkmark" />SAVE
          </Button>
        </Modal.Footer>
      </div>
    );
  }
}

CommonMerge.propTypes = propTypes;
CommonMerge.contextTypes = contextTypes;

export default CommonMerge;
