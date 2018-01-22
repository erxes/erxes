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
  basicInfos: PropTypes.object
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class CommonMerge extends React.Component {
  constructor(props) {
    super(props);
    const { basicInfos } = this.props;

    this.state = basicInfos;

    this.onChange = this.onChange.bind(this);
    this.save = this.save.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { datas, basicInfos } = nextProps;
    const init = datas[0];

    for (let info in basicInfos) {
      if (init.hasOwnProperty(info)) {
        this.setState({
          [info]: {
            ...this.state[info],
            New: false,
            value: init[info] || 'N/A'
          }
        });
      }
    }
  }

  renderOptions(fieldName) {
    const { datas } = this.props;
    const options = [];

    datas.forEach(data => {
      options.push(<option key={data._id}>{data[fieldName] || 'N/A'}</option>);
    });
    options.push(
      <option key={options.length + 1} name="New">
        New
      </option>
    );
    return options;
  }

  renderInputOrSelect(field, info) {
    let input = (
      <FormControl
        componentClass="select"
        name={info}
        onChange={e => this.onChange(e)}
      >
        {this.renderOptions(info)}
      </FormControl>
    );

    if (this.state[info].New) {
      input = (
        <FormControl
          key={info}
          name={info}
          autoFocus
          onChange={e => this.onChange(e)}
        />
      );
    }

    return (
      <FormGroup key={info}>
        <ControlLabel>{field[info].text}</ControlLabel>
        {input}
      </FormGroup>
    );
  }

  renderField(field) {
    const wrapper = [];

    for (let info in field) {
      if (field.hasOwnProperty(info)) {
        wrapper.push(this.renderInputOrSelect(field, info));
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
    const ids = [];

    for (let info in this.state) {
      if (this.state.hasOwnProperty(info)) {
        if (this.state[info].value !== 'N/A') {
          data[info] = this.state[info].value;
        }
      }
    }
    datas.forEach(data => {
      ids.push(data._id);
    });

    this.props.save({
      ids,
      data,
      callback: () => {
        this.context.closeModal();
      }
    });
  }

  render() {
    const { basicInfos } = this.props;

    return (
      <div>
        {this.renderField(basicInfos)}
        <Modal.Footer>
          <Button
            btnStyle="simple"
            icon="close"
            onClick={() => this.context.closeModal()}
          >
            Cancel
          </Button>
          <Button btnStyle="success" icon="checkmark" onClick={this.save}>
            Save
          </Button>
        </Modal.Footer>
      </div>
    );
  }
}

CommonMerge.propTypes = propTypes;
CommonMerge.contextTypes = contextTypes;

export default CommonMerge;
