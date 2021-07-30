import { __ } from 'modules/common/utils';
import React from 'react';
// import Select from 'react-select-plus';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';
// import FormGroup from 'modules/common/components/form/Group';
// import ControlLabel from 'modules/common/components/form/Label';
import { IAction, ITrigger } from 'modules/automations/types';

import GenerateField from 'modules/settings/properties/components/GenerateField';
import { IField } from 'modules/settings/properties/types';
import { SidebarContent } from 'modules/inbox/components/leftSidebar/styles';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  fetchFormFields: (
    formId: string,
    callback: (fields: IField[]) => void
  ) => void;
  currentAction: {
    trigger: ITrigger;
    action: IAction;
  };
  addAction: (value: string, contentId?: string) => void;
};

type State = {
  formFields?: IField[];
  queryLoaded: boolean;
};

class TriggerDetailForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      queryLoaded: false,
      formFields: []
    };
  }

  onSave = () => {
    const {
      closeParentModal,
      closeModal,
      addAction,
      currentAction
    } = this.props;

    addAction(currentAction.action.type);
    closeParentModal ? closeParentModal() : closeModal();
  };

  onChangeForm = option => {
    // this.setState({ activeFormId: option.value });
  };

  renderFormFields() {
    const { currentAction } = this.props;
    const fields = this.state.formFields || [];

    if (
      currentAction.action.type !== 'if' ||
      currentAction.trigger.type !== 'formSubmit'
    ) {
      return null;
    }

    // const onClickItem = () => {
    //   // if (onClick) {
    //   //   onClick(field);
    //   // }
    // };

    return (
      <SidebarContent>
        {fields.map((field, index) => {
          return <GenerateField field={field} key={index} />;
        })}
      </SidebarContent>
    );
  }

  render() {
    const { currentAction, closeModal } = this.props;
    const { config = {} } = currentAction.trigger;

    if (
      !this.state.queryLoaded &&
      currentAction.action.type === 'if' &&
      currentAction.trigger.type === 'formSubmit' &&
      config.contentId
    ) {
      const { fetchFormFields } = this.props;

      fetchFormFields(config.contentId, (fields: IField[]) => {
        if (fields) {
          this.setState({
            formFields: fields,
            queryLoaded: true
          });
        }
      });
    }

    return (
      <>
        {this.renderFormFields()}
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          <Button btnStyle="success" icon="checked-1" onClick={this.onSave}>
            Save
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default TriggerDetailForm;
