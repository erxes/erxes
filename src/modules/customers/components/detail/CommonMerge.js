import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Button,
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
    this.basicInfos = {
      firstName: { text: 'First Name', New: false, value: '' },
      lastName: { text: 'Last Name', New: false, value: '' },
      email: { text: 'E-mail', New: false, value: '' },
      phone: { text: 'Phone', New: false, value: '' }
    };

    if (type === 'company') {
      this.basicInfos = {
        name: { text: 'Company Name', New: false, value: '' },
        size: { text: 'Company Size', New: false, value: '' },
        website: { text: 'Company Website', New: false, value: '' },
        industry: { text: 'Company Industry', New: false, value: '' },
        plant: { text: 'Company Plan', New: false, value: '' }
      };
    }

    this.state = this.basicInfos;

    this.onChange = this.onChange.bind(this);
    this.save = this.save.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { datas } = nextProps;
    const init = datas[0];
    const fields = this.basicInfos;

    for (let key in fields) {
      if (init.hasOwnProperty(key)) {
        this.setState({
          [key]: { ...this.state[key], value: init[key] || '' }
        });
      }
    }
  }

  renderOptions(fieldName) {
    const { datas } = this.props;
    const options = [];

    datas.forEach(data => {
      options.push(<option key={data._id}>{data[fieldName] || ''}</option>);
    });
    options.push(
      <option key="123" name="New">
        New
      </option>
    );
    return options;
  }

  renderInputOrSelect(field, key) {
    let input = (
      <FormControl
        componentClass="select"
        name={key}
        onChange={e => this.onChange(e)}
      >
        {this.renderOptions(key)}
      </FormControl>
    );

    if (this.state[key].New) {
      input = (
        <FormControl
          key={key}
          name={key}
          autoFocus
          onChange={e => this.onChange(e)}
        />
      );
    }

    return (
      <FormGroup key={key}>
        <ControlLabel>{field[key].text}</ControlLabel>
        {input}
      </FormGroup>
    );
  }

  renderField(field) {
    const wrapper = [];

    for (let key in field) {
      if (field.hasOwnProperty(key)) {
        wrapper.push(this.renderInputOrSelect(field, key));
      }
    }

    return wrapper;
  }

  onChange(e) {
    const value = e.target.value;
    const name = e.target.name;
    if (e.target.options) {
      const options = e.target.options;
      const selected = options[options.selectedIndex].text;

      if (selected === 'New') {
        this.setState({ [name]: { ...[name], New: true } });
        return;
      }
    }

    this.setState({
      [name]: { ...this.state[name], value }
    });
  }

  save() {
    const { datas } = this.props;
    const data = {};

    for (let key in this.state) {
      if (this.state.hasOwnProperty(key)) {
        data[key] = this.state[key].value;
      }
    }
    const Ids = [];
    datas.forEach(data => {
      Ids.push(data._id);
    });

    this.props.save({
      Ids,
      data,
      callback: () => {
        this.context.closeModal();
      }
    });
  }

  render() {
    return (
      <div>
        {this.renderField(this.basicInfos)}
        <Modal.Footer>
          <Button
            btnStyle="simple"
            icon="close"
            onClick={() => this.context.closeModal()}
          >
            CANCEL
          </Button>
          <Button btnStyle="success" icon="checkmark" onClick={this.save}>
            SAVE
          </Button>
        </Modal.Footer>
      </div>
    );
  }
}

CommonMerge.propTypes = propTypes;
CommonMerge.contextTypes = contextTypes;

export default CommonMerge;
