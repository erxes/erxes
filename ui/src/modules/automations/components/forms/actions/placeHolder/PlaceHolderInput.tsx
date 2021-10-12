import { BoardHeader } from 'modules/automations/styles';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import { IOption } from 'modules/common/types';
import { FieldsCombinedByType } from 'modules/settings/properties/types';
import React from 'react';

import Attribution from '../../../../containers/forms/actions/Attribution';
import SelectBoard from './SelectBoard';
import SelectDate from './SelectDate';
import SelectOption from './SelectOption';

type Props = {
  onChange: (config: any) => void;
  triggerType: string;
  inputName: string;
  label: string;
  type?: string;
  attrType?: string;
  fieldType?: string;
  config?: any;
  options?: IOption[];
  isMulti?: boolean;
  excludeAttr?: boolean;
  customAttributions?: FieldsCombinedByType[];
};

type State = {
  config: any;
};

class PlaceHolderInput extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    let { config } = this.props;
    const { inputName } = this.props;

    if (!config) {
      config = {};
    }

    if (!Object.keys(config).includes(inputName)) {
      config[inputName] = '';
    }

    this.state = {
      config
    };
  }

  renderSelect() {
    const { fieldType, options, inputName, isMulti } = this.props;
    if (fieldType !== 'select') {
      return '';
    }

    return (
      <SelectOption
        inputName={inputName}
        config={this.state.config}
        setConfig={conf => this.setState({ config: conf })}
        triggerType={this.props.triggerType}
        options={options || []}
        isMulti={isMulti}
      />
    );
  }

  renderBoardSelect() {
    const { type, fieldType, inputName } = this.props;

    if (fieldType !== 'stage' || !type) {
      return '';
    }

    return (
      <SelectBoard
        type={type}
        config={this.state.config}
        setConfig={conf => this.setState({ config: conf })}
        triggerType={this.props.triggerType}
        inputName={inputName}
      />
    );
  }

  renderDate() {
    const { fieldType, inputName } = this.props;
    if (fieldType !== 'date') {
      return '';
    }

    return (
      <SelectDate
        inputName={inputName}
        config={this.state.config}
        setConfig={conf => this.setState({ config: conf })}
        triggerType={this.props.triggerType}
      />
    );
  }

  getOnlySet = () => {
    const { fieldType, options, isMulti } = this.props;

    if (!fieldType) {
      return false;
    }

    if (['select'].includes(fieldType) || options) {
      return !isMulti;
    }

    if (['date'].includes(fieldType) || options) {
      return true;
    }

    return false;
  };

  renderAttribution() {
    const { excludeAttr, inputName, attrType, fieldType } = this.props;
    if (excludeAttr || fieldType === 'stage') {
      return '';
    }

    return (
      <Attribution
        inputName={inputName}
        config={this.state.config}
        setConfig={conf => this.setState({ config: conf })}
        triggerType={this.props.triggerType}
        onlySet={this.getOnlySet()}
        fieldType={fieldType}
        attrType={attrType}
        customAttributions={this.props.customAttributions}
      />
    );
  }

  onChange = e => {
    const { inputName, fieldType } = this.props;
    if (['select'].includes(fieldType || '')) {
      return;
    }

    const { config } = this.state;
    const value = (e.target as HTMLInputElement).value;
    config[inputName] = value;

    this.setState({ config });
    this.props.onChange(config);
  };

  onKeyPress = (e: React.KeyboardEvent) => {
    if (['Backspace', 'Delete'].includes(e.key)) {
      e.preventDefault();

      const { config, inputName, fieldType } = this.props;

      if (fieldType === 'select') {
        config[inputName] = '';

        this.props.onChange(config);
        return;
      }

      const target = e.target as HTMLInputElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      let chIndex = 0;
      let index = 0;

      const re = /(\[\[( ?\w* |)\]\]|\{\{( ?\w* |)\}\})|\w| /gi;
      const value = target.value;

      const matches = value.match(re) || [];
      const by = {};

      for (const match of matches) {
        const len = match.length;
        const prevCh = chIndex;
        chIndex += len;

        by[index] = { min: prevCh + 1, max: chIndex };
        index += 1;
      }

      const deletes = Object.keys(by).filter(key => {
        const val = by[key];

        if (start === end && val.min < start && val.max < start) {
          return null;
        }

        if (start < end && val.min <= start && val.max <= start) {
          return null;
        }

        if (val.min > end && val.max > end) {
          return null;
        }

        return key;
      });

      config[inputName] = matches
        .filter((_m, i) => !deletes.includes(String(i)))
        .join('');

      this.setState({ config });
      this.props.onChange(config);
    }
  };

  render() {
    const { config } = this.state;
    const { options = [], inputName, label, fieldType = 'string' } = this.props;

    let converted: string = config[inputName] || '';

    if (fieldType === 'select') {
      const re = /(\[\[ \w* \]\])/gi;

      const ids = converted.match(re) || [];
      const listById = ids.map(ch => {
        const id = ch.replace('[[ ', '').replace(' ]]', '');
        const option = options.find(o => o.value === id) || {
          value: '',
          label: ''
        };
        return { byId: ch, byName: `[[ ${option.label} ]]` };
      });

      for (const rep of listById) {
        converted = converted.replace(rep.byId, rep.byName);
      }
    }
    if (fieldType === 'stage') {
      converted = `[[ ${config.stageName} ]]`;
    }

    return (
      <BoardHeader>
        <FormGroup>
          <div className="header-row">
            <ControlLabel>{label}</ControlLabel>
            <div>
              {this.renderSelect()}
              {this.renderDate()}
              {this.renderBoardSelect()}
              {this.renderAttribution()}
            </div>
          </div>

          <FormControl
            name={inputName}
            value={converted}
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            onKeyDown={this.onKeyPress}
          />
        </FormGroup>
      </BoardHeader>
    );
  }
}

export default PlaceHolderInput;
