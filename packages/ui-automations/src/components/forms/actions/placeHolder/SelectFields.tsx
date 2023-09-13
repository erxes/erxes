import { FieldsCombinedByType } from '@erxes/ui-forms/src/settings/properties/types';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { Attributes } from '../styles';
import PlaceHolderInput from './PlaceHolderInput';

type Props = {
  triggerType: string;
  config: any;
  label: string;
  attributions: FieldsCombinedByType[];
  onSelect: (config: any) => void;
  withDefaultValue?: boolean;
};

type State = {
  fields: FieldsCombinedByType[];
};

class SelectFields extends React.Component<Props, State> {
  private overlay: any;

  constructor(props) {
    super(props);

    this.state = {
      fields: []
    };
  }

  componentDidMount() {
    const { config = {}, attributions = [] } = this.props;

    const selectedFields = attributions.filter(attribution =>
      Object.keys(config).includes(attribution.name)
    );

    if (selectedFields.length) {
      this.setState({ fields: selectedFields });
    }
  }

  hideContent = () => {
    this.overlay.hide();
  };

  renderContent() {
    const { attributions, onSelect, config, withDefaultValue } = this.props;
    const { fields } = this.state;

    const onClickField = item => {
      this.setState({ fields: [...fields, item] });

      withDefaultValue &&
        onSelect({ ...config, [item.name]: `{{ ${item.name} }}` });

      this.hideContent();
    };

    return (
      <Popover id="field-popover">
        <Attributes>
          <React.Fragment>
            <li>
              <b>{__('Fields')}</b>
            </li>
            {attributions
              .filter(
                attribution =>
                  !fields.find(field => field._id === attribution._id)
              )
              .map(item => (
                <li key={item.name} onClick={onClickField.bind(this, item)}>
                  {__(item.label)}
                </li>
              ))}
          </React.Fragment>
        </Attributes>
      </Popover>
    );
  }

  renderFields() {
    const { triggerType, config, onSelect } = this.props;
    const { fields } = this.state;

    const removeField = ({ _id, name }) => {
      this.setState({ fields: fields.filter(field => field._id !== _id) });

      onSelect({ ...config, [name]: undefined });
    };

    return fields.map(field => (
      <PlaceHolderInput
        key={field._id}
        inputName={field.name}
        label={field.label}
        config={config}
        onChange={onSelect}
        triggerType={triggerType}
        fieldType={field.type === 'Date' ? 'date' : field.type}
        options={field.selectOptions || []}
        optionsAllowedTypes={['contact']}
        isMulti={true}
        additionalContent={
          <Button
            btnStyle="danger"
            size="small"
            onClick={removeField.bind(this, field)}
          >
            <Icon icon="cancel-1" />
          </Button>
        }
      />
    ));
  }

  render() {
    const { label } = this.props;

    return (
      <>
        {this.renderFields()}
        <OverlayTrigger
          ref={overlay => {
            this.overlay = overlay;
          }}
          trigger="click"
          placement="top"
          overlay={this.renderContent()}
          rootClose={true}
          container={this}
        >
          <Button btnStyle="simple" block icon="add">
            {__(label || '')}
          </Button>
        </OverlayTrigger>
      </>
    );
  }
}

export default SelectFields;
