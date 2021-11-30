import { BoardHeader } from 'modules/automations/styles';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import { IOption } from 'modules/common/types';
import React from 'react';

import Attribution from './Attribution';

type Props = {
  onChange: (config: any) => void;
  triggerType: string;
  inputName: string;
  label: string;
  config?: any;
  options?: IOption[];
  isMulti?: boolean;
  attributions: any[];
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.config !== this.props.config) {
      this.setState({ config: nextProps.config });
    }
  }

  onSelect = conf => {
    const { inputName } = this.props;
    const { config } = this.state;
    config[inputName] = conf[inputName];

    this.setState({ config });

    this.props.onChange({ ...config });
  };

  renderAttribution() {
    const { inputName } = this.props;

    return (
      <Attribution
        inputName={inputName}
        config={this.state.config}
        setConfig={conf => this.onSelect(conf)}
        triggerType={this.props.triggerType}
        attributions={this.props.attributions}
      />
    );
  }

  onChange = e => {
    const { inputName } = this.props;

    const { config } = this.state;
    const value = (e.target as HTMLInputElement).value;
    config[inputName] = value;

    this.setState({ config });
    this.props.onChange(config);
  };

  onKeyPress = (e: React.KeyboardEvent) => {
    if (['Backspace', 'Delete'].includes(e.key)) {
      e.preventDefault();

      const { config, inputName } = this.props;

      const target = e.target as HTMLInputElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      let chIndex = 0;
      let index = 0;

      const re = /{([^}]+)}|\W|_/g;
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
    const { inputName, label } = this.props;

    const converted: string = config[inputName] || '';

    return (
      <BoardHeader>
        <FormGroup>
          <div className="header-row">
            <ControlLabel>{label}</ControlLabel>
            <div>{this.renderAttribution()}</div>
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
