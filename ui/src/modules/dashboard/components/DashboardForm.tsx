import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { SelectMemberStyled } from 'modules/settings/boards/styles';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React, { useState } from 'react';
import { IDashboard } from '../types';

type Props = {
  dashboard?: IDashboard;
  trigger?: React.ReactNode;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  visibility: string;
  selectedMemberIds: string[];
};

type FinalProps = {
  closeModal: () => void;
} & Props;

function DashbaordFormContent(props: FinalProps) {
  const dashboard = props.dashboard;

  const [state, setState] = useState<State>({
    visibility: dashboard ? dashboard.visibility || 'public' : 'public',
    selectedMemberIds: dashboard ? dashboard.selectedMemberIds || [] : []
  });

  const generateDoc = (values: { _id?: string; name: string }) => {
    const { selectedMemberIds, visibility } = state;
    const finalValues = values;

    if (dashboard) {
      finalValues._id = dashboard._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      visibility,
      selectedMemberIds
    };
  };

  const onChangeVisibility = (e: React.FormEvent<HTMLElement>) => {
    setState({
      ...state,
      visibility: (e.currentTarget as HTMLInputElement).value
    });
  };

  const onChangeMembers = selectedMemberIds => {
    setState({ ...state, selectedMemberIds });
  };

  const renderSelectMembers = () => {
    const { visibility, selectedMemberIds } = state;
    if (visibility === 'public') {
      return;
    }

    return (
      <FormGroup>
        <SelectMemberStyled zIndex={2002}>
          <ControlLabel>Members</ControlLabel>

          <SelectTeamMembers
            label="Choose members"
            name="selectedMemberIds"
            initialValue={selectedMemberIds}
            onSelect={onChangeMembers}
          />
        </SelectMemberStyled>
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { renderButton } = props;
    const { visibility } = state;
    const { values, isSubmitted } = formProps;
    const object = dashboard || { name: '' };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Visibility</ControlLabel>
          <FormControl
            {...formProps}
            name="visibility"
            componentClass="select"
            value={visibility}
            onChange={onChangeVisibility}
          >
            <option value="public">{__('Public')}</option>
            <option value="private">{__('Private')}</option>
          </FormControl>
        </FormGroup>

        {renderSelectMembers()}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            icon="times-circle"
            onClick={props.closeModal}
          >
            Cancel
          </Button>

          {renderButton({
            name: 'dashboard',
            values: generateDoc(values),
            isSubmitted,
            callback: props.closeModal,
            object: dashboard
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form {...props} renderContent={renderContent} />;
}

const DashbaordForm = (props: Props) => {
  const defatulTrigger = (
    <Button icon="sitemap-1">{__('Create new Dashboard')}</Button>
  );

  const { dashboard, trigger = defatulTrigger, renderButton } = props;

  const content = modalProps => {
    const updatedProps = {
      ...modalProps,
      dashboard,
      renderButton
    };

    return <DashbaordFormContent {...updatedProps} />;
  };

  return (
    <ModalTrigger
      title={dashboard ? `Edit dashboard` : `Add dashboard`}
      autoOpenKey="showDashboardAddModal"
      trigger={trigger}
      content={content}
    />
  );
};

export default DashbaordForm;
