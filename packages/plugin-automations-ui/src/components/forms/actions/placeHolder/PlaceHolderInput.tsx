import { BoardHeader } from '../../../../styles';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IOption } from '@erxes/ui/src/types';
import { FieldsCombinedByType } from '@erxes/ui-settings/src/properties/types';
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

  renderSelect() {
    const { fieldType, options, inputName, isMulti } = this.props;
    if (fieldType !== 'select') {
      return '';
    }

    return (
      <SelectOption
        inputName={inputName}
        config={this.state.config}
        setConfig={conf => this.onSelect(conf)}
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
        setConfig={conf => this.onSelect(conf)}
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
        setConfig={conf => this.onSelect(conf)}
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
        setConfig={conf => this.onSelect(conf)}
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
          />
        </FormGroup>
      </BoardHeader>
    );
  }
}

export default PlaceHolderInput;
