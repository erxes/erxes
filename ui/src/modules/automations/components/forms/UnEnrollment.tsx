import React from 'react';
import Select from 'react-select-plus';
import { __ } from 'modules/common/utils';
import FormGroup from 'modules/common/components/form/Group';
import FormControl from 'modules/common/components/form/Control';

type Props = {};

class UnEnrollment extends React.Component<Props> {
  render() {
    return (
      <div>
        <h3>{__('Unenrollment and suppression')}</h3>
        <div>
          <p>{'What times do you want the actions to execute'}?</p>
          <FormGroup>
            <FormControl
              componentClass="radio"
              value="any"
              // onChange={this.onChangeTimeType}
              // checked={time === "any"}
              inline={true}
            >
              {__('Any time')}
            </FormControl>

            <FormControl
              componentClass="radio"
              value="specific"
              // onChange={this.onChangeTimeType}
              // checked={time === "specific"}
              inline={true}
            >
              {__('Specific times')}
            </FormControl>
            <FormControl
              componentClass="radio"
              value="specific"
              // onChange={this.onChangeTimeType}
              // checked={time === "specific"}
              inline={true}
            >
              {__('Specific times')}
            </FormControl>
          </FormGroup>
        </div>

        <div>
          <p>{'What times do you want the actions to execute'}?</p>
          <FormGroup>
            <FormControl
              componentClass="radio"
              value="any"
              // onChange={this.onChangeTimeType}
              // checked={time === "any"}
              inline={true}
            >
              {__('Any time')}
            </FormControl>

            <FormControl
              componentClass="radio"
              value="specific"
              // onChange={this.onChangeTimeType}
              // checked={time === "specific"}
              inline={true}
            >
              {__('Specific times')}
            </FormControl>
          </FormGroup>
        </div>

        <div>
          <p>{'What times do you want the actions to execute'}?</p>
          <FormGroup>
            <FormControl
              componentClass="radio"
              value="any"
              // onChange={this.onChangeTimeType}
              // checked={time === "any"}
              inline={true}
            >
              {__('Any time')}
            </FormControl>

            <FormControl
              componentClass="radio"
              value="specific"
              // onChange={this.onChangeTimeType}
              // checked={time === "specific"}
              inline={true}
            >
              {__('Specific times')}
            </FormControl>
          </FormGroup>
        </div>

        <div>
          <p>{'What times do you want the actions to execute'}?</p>
          <Select
            isRequired={true}
            value={''}
            options={[]}
            // onChange={this.onChangeForm}
            placeholder={__('Select')}
          />
        </div>
      </div>
    );
  }
}

export default UnEnrollment;
