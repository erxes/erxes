import Button from 'modules/common/components/Button';
import Info from 'modules/common/components/Info';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import { IField, IFieldLogic } from 'modules/settings/properties/types';
import React from 'react';
// import { ILeadIntegration } from '../types';
import { LinkButton } from 'modules/settings/team/styles';
import Icon from 'modules/common/components/Icon';
// import FieldLogic from 'modules/forms/components/FieldLogic';
import FieldRule from 'modules/forms/components/FieldRule';
import { FormGroup } from 'erxes-ui';

type Props = {
  fields: IField[];
  closeModal?: () => void;
};

type State = {
  code?: string;
  logics: IFieldLogic[];
};

class AdvancedSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const code = '';
    const logics = [];

    this.state = {
      code,
      logics
    };
  }

  addRule = () => {
    const logic = {
      fieldId: '',
      targetFieldId: '',
      tempFieldId: '',
      logicOperator: '',
      logicValue: '',
      logicAction: ''
    };
    const { logics } = this.state;
    logics.push(logic);

    this.setState({ logics });
  };

  onChangeLogic = (name, value, index) => {
    // find current editing one
    const { logics } = this.state;
    // if (isLogic) {
    const currentLogic = logics.find((l, i) => i === index);

    // set new value
    if (currentLogic) {
      currentLogic[name] = value;
    }

    console.log('currentLogic: ', currentLogic);

    // setLogics(logics);
    // return onFieldChange('logics', logics);
    // }
    this.setState({ logics });
  };

  removeLogic = (index: number) => {
    // setLogics(logics.filter((l, i) => i !== index));
    console.log(index);
  };

  renderRows = () => {
    const { logics } = this.state;

    return (
      <FormGroup>
        {logics.map((item, index) => (
          <FieldRule
            key={index}
            onChangeLogic={this.onChangeLogic}
            removeLogic={this.removeLogic}
            // onChangeProperty={props.onPropertyChange}
            fields={this.props.fields}
            index={index}
            logic={item}
            // tags={props.tags}
            // currentField={props.currentField}
            // type={type}
          />
        ))}
      </FormGroup>
    );
  };

  render() {
    return (
      <>
        <Info>
          {__(
            'Create rules to show or hide this element depending on the values of other fields'
          )}
        </Info>

        <LinkButton onClick={this.addRule}>
          <Icon icon="plus-1" /> {`Add rule`}
        </LinkButton>

        {this.renderRows()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="times-circle"
            uppercase={false}
            onClick={this.props.closeModal}
          >
            Close
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default AdvancedSettings;
