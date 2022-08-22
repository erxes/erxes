import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  __
} from '@erxes/ui/src';
import { Column } from '@erxes/ui/src/styles/main';
import React from 'react';
import { LogicItem, LogicRow, RowSmall } from '../styles';

type Props = {
  defaultValue: string;
  onchange: (value: any) => any;
  options: string[];
  onChangeOptions: (
    field: string,
    options: string[] | string | object[]
  ) => any;
  fieldType: string;
};

type State = {
  optionsObj: { key: number; value?: string; label?: string }[];
  value: string;
};

class RiskAssessmenOptions extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      optionsObj: [],
      value: ''
    };

    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.addOption = this.addOption.bind(this);
  }

  handleOptionsChange(e) {
    const { name, value, id } = e.currentTarget as HTMLInputElement;

    if (name === 'defaultValue') {
      this.props.onChangeOptions('value', value);
      return this.setState({ value });
    }

    const newOptions = this.state.optionsObj.map(p =>
      p.key === parseInt(id) ? { ...p, [name]: value } : p
    );

    if (name === 'label') {
      const options = this.props.options.map((option, i) =>
        i === parseInt(id) - 1 ? value : option
      );
      this.props.onChangeOptions('options', options);
      this.props.onChangeOptions('optionsObj', this.state.optionsObj);
    }

    this.setState({ optionsObj: newOptions });
  }

  renderOptionsField(option) {
    return (
      <LogicItem key={option.key}>
        <LogicRow>
          <Column>
            <LogicRow>
              <RowSmall>
                <ControlLabel>
                  {__('Key')}
                  <FormControl disabled defaultValue={option.key} />
                </ControlLabel>
              </RowSmall>
              <RowSmall>
                <ControlLabel>
                  {__('Label')}
                  <FormControl
                    id={option.key}
                    type="text"
                    value={option.label}
                    name="label"
                    onChange={this.handleOptionsChange}
                  />
                </ControlLabel>
              </RowSmall>
              <RowSmall>
                <ControlLabel>
                  {__('Value')}
                  <FormControl
                    id={option.key}
                    type="text"
                    name="value"
                    value={option.value}
                    onChange={this.handleOptionsChange}
                  />
                </ControlLabel>
              </RowSmall>
            </LogicRow>
          </Column>
          <Button
            onClick={() => this.removeOption(option.key)}
            btnStyle="danger"
            icon="times"
          />
        </LogicRow>
      </LogicItem>
    );
  }

  removeOption(key: number) {
    const optionsObj = this.state.optionsObj
      .filter(p => p.key !== key)
      .map((p, i) => ({ ...p, key: i + 1 }));

    const options = this.props.options.filter((p, i) => i !== key - 1);

    this.props.onChangeOptions('options', options);

    this.setState({ optionsObj });
  }
  addOption() {
    const index = this.state.optionsObj.length + 1;
    const newObj = { key: index, value: '', label: '' };

    const options = [...this.props.options, ''];
    this.props.onChangeOptions('options', options);

    this.setState({ optionsObj: [...this.state.optionsObj, newObj] });
  }

  render() {
    const { onchange, fieldType } = this.props;

    return (
      <>
        <FormGroup>
          <ControlLabel>Field Type:</ControlLabel>
          <FormControl
            componentClass="select"
            name="riskAssessmentFieldType"
            defaultValue={'text'}
            onChange={onchange}
          >
            <option key="text" value="text">
              {__('Text')}
            </option>
            <option key="textarea" value="textarea">
              {__('Text Area')}
            </option>
            <option key="select" value="select">
              {__('Select')}
            </option>
            <option key="checkbox" value="checkbox">
              {__('Checkbox')}
            </option>
            <option key="radio" value="radio">
              {__('Radio')}
            </option>
          </FormControl>
        </FormGroup>
        {['text', 'textarea'].includes(fieldType) && (
          <FormGroup>
            <ControlLabel>{__('Value')}</ControlLabel>
            <FormControl
              name="defaultValue"
              onChange={this.handleOptionsChange}
            />
          </FormGroup>
        )}
        {['select', 'checkbox', 'radio'].includes(fieldType) && (
          <div>
            {this.state.optionsObj.map(p => this.renderOptionsField(p))}
            <Button btnStyle="link" onClick={this.addOption} icon="add">
              {__('add option')}
            </Button>
          </div>
        )}
      </>
    );
  }
}

export default RiskAssessmenOptions;
