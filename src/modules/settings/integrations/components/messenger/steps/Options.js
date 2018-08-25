import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import {
  FormControl,
  FormGroup,
  ControlLabel
} from 'modules/common/components';
import { LeftItem, FlexItem } from 'modules/common/components/step/styles';
import { SelectBrand } from 'modules/settings/integrations/components';

const propTypes = {
  onChange: PropTypes.func,
  brandId: PropTypes.string,
  languageCode: PropTypes.string,
  brands: PropTypes.array.isRequired,
  notifyCustomer: PropTypes.bool
};

class Options extends Component {
  constructor(props) {
    super(props);

    this.onChangeFunction = this.onChangeFunction.bind(this);
  }

  onChangeFunction(name, value) {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  }

  render() {
    return (
      <FlexItem odd>
        <LeftItem>
          <SelectBrand
            brands={this.props.brands}
            defaultValue={this.props.brandId}
            onChange={e => this.onChangeFunction('brandId', e.target.value)}
          />

          <FormGroup>
            <ControlLabel>Language</ControlLabel>

            <FormControl
              componentClass="select"
              id="languageCode"
              defaultValue={this.props.languageCode}
              onChange={e =>
                this.onChangeFunction('languageCode', e.target.value)
              }
            >
              <option />
              <option value="mn">Монгол</option>
              <option value="en">English</option>
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Notify customer</ControlLabel>
            <div>
              <Toggle
                className="wide"
                checked={this.props.notifyCustomer}
                onChange={e =>
                  this.onChangeFunction('notifyCustomer', e.target.checked)
                }
                icons={{
                  checked: <span>Yes</span>,
                  unchecked: <span>No</span>
                }}
              />
            </div>
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

Options.propTypes = propTypes;
Options.contextTypes = {
  __: PropTypes.func
};

export default Options;
