import React from 'react';
import { Description } from '@erxes/ui-settings/src/styles';
import { Alert, __ } from '@erxes/ui/src/utils';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { FlexColumn, FlexItem } from '@erxes/ui/src/components/step/style';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import FieldChoices from './FieldChoices';
import FieldForm from '../FieldForm';

type Props = {
  onChange: (key: string, value: any) => void;
  displayName: string;
  code: string;
  fields: any[];
};

type State = {
  currentField: any;
  currentMode: any;
};

class Step extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentMode: undefined,
      currentField: undefined
    };
  }

  onFieldSubmit = (field: any) => {
    const { onChange, fields } = this.props;
    const { currentMode } = this.state;

    let duplicated: boolean = false;

    fields.forEach(fld => {
      if (fld.code === field.code) {
        duplicated = true;
      }
    });

    if (duplicated) {
      return Alert.error('Sorry field code duplicated!');
    }

    let updatedFields = fields;

    if (currentMode === 'create') {
      field._id = Math.random();

      updatedFields = [...fields, field];
    }

    onChange('fields', updatedFields);

    this.setState({ currentField: undefined });
  };

  render() {
    const { onChange, displayName, code } = this.props;
    const { currentField, currentMode } = this.state;

    const onFieldFormCancel = () => {
      this.setState({ currentField: undefined });
    };

    const onChoiceClick = (choice: string) => {
      this.setState({
        currentMode: 'create',
        currentField: {
          code: '',
          text: '',
          type: choice,
          show: false
        }
      });
    };

    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem deactive={false}>
            <FormGroup>
              <ControlLabel required={true}>{__('Display name')}</ControlLabel>
              <FormControl
                required={true}
                name="displayName"
                value={displayName}
                onChange={(e: any) => onChange('displayName', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>{__('Code')}</ControlLabel>
              <FormControl
                required={true}
                name="code"
                value={code}
                onChange={(e: any) => onChange('code', e.target.value)}
              />
            </FormGroup>

            <p>{__('Add a new field')}</p>
            <Description>
              {__('Choose a field type from the options below.')}
            </Description>

            <FieldChoices type={'input'} onChoiceClick={onChoiceClick} />

            {currentField && (
              <FieldForm
                mode={currentMode || 'create'}
                field={currentField}
                onSubmit={this.onFieldSubmit}
                onCancel={onFieldFormCancel}
              />
            )}
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default Step;
