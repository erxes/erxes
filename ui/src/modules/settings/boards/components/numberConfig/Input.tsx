import { BoardHeader } from 'modules/automations/styles';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import { Alert } from 'modules/common/utils';
import React from 'react';

import Attribution from './Attribution';

type Props = {
  onChange: (config: string) => void;
  label: string;
  config: string;
  attributions: any[];
};

type State = {
  config: string;
};

class PlaceHolderInput extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { config } = this.props;

    this.state = {
      config
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.config !== this.props.config) {
      this.setState({ config: nextProps.config });
    }
  }

  onChange = (conf, value) => {
    const { config } = this.props;

    if (config && config.includes('{number}') && value !== 'number') {
      return Alert.error(
        'You cannot add an attribute after the number attribute!'
      );
    }

    this.props.onChange(conf);
  };

  renderAttribution() {
    return (
      <Attribution
        config={this.state.config}
        setConfig={(conf, value) => this.onChange(conf, value)}
        attributions={this.props.attributions}
      />
    );
  }

  onKeyPress = (e: React.KeyboardEvent) => {
    if (['Backspace', 'Delete'].includes(e.key)) {
      e.preventDefault();

      let { config } = this.props;

      const target = e.target as HTMLInputElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      let chIndex = 0;
      let index = 0;

      const re = /{([^}]+)}|\w|\W|_/g;
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

      config = matches.filter((_m, i) => !deletes.includes(String(i))).join('');

      this.props.onChange(config);
    }
  };

  render() {
    const { config } = this.state;
    const { label } = this.props;

    const converted: string = config;

    return (
      <BoardHeader>
        <FormGroup>
          <div className="header-row">
            <ControlLabel>{label}</ControlLabel>
            <div>{this.renderAttribution()}</div>
          </div>
          <p>Please add at least one number attribute</p>
          <FormControl
            value={converted}
            onKeyPress={this.onKeyPress}
            onKeyDown={this.onKeyPress}
            onChange={(e: any) => this.onChange(e.target.value, '')}
          />
        </FormGroup>
      </BoardHeader>
    );
  }
}

export default PlaceHolderInput;
