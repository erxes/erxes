import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IFormProps } from '@erxes/ui/src/types';
import Info from '@erxes/ui/src/components/Info';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import Select from 'react-select-plus';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { __ } from 'coreui/utils';
import { renderUserFullName } from '@erxes/ui/src/utils';

type Props = {
  units: any;
  item: any;
  shareFile: (attr: any) => void;
  closeModal: () => void;
};

type State = {
  userIds: string[];
  selectedUnit: any;
};

class ShareForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      userIds: [],
      selectedUnit: {} as any
    };
  }

  usersOnChange = userIds => {
    this.setState({ userIds });
  };

  onSave = values => {
    const { userIds, selectedUnit } = this.state;
    const { item, shareFile } = this.props;

    shareFile({
      type: item.folderId ? 'file' : 'folder',
      _id: item._id,
      userIds,
      unitId: selectedUnit.value
    });
  };

  generateParams = options => {
    return options.map(option => ({
      value: option._id,
      label: option.title
    }));
  };

  renderContent = (formProps: IFormProps) => {
    const onChange = selectedUnit => {
      this.setState({ selectedUnit });
    };

    const { sharedUsers = [] } = this.props.item || {};

    return (
      <>
        <Info>
          Shared with {sharedUsers.length || 0} members: &nbsp;
          {sharedUsers.map(user => (
            <small key={user._id}>{renderUserFullName(user)}, &nbsp;</small>
          ))}
        </Info>

        <FormGroup>
          <ControlLabel>{__('Team members')}</ControlLabel>
          <SelectTeamMembers
            label={__('Choose team members')}
            name="userId"
            onSelect={this.usersOnChange}
            multi={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Unit')}</ControlLabel>
          <Select
            placeholder={__('Choose Unit')}
            value={this.state.selectedUnit}
            options={this.generateParams(this.props.units)}
            onChange={onChange}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          <Button type="submit" btnStyle="success" icon="share-alt">
            {__('Share')}
          </Button>
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} onSubmit={this.onSave} />;
  }
}

export default ShareForm;
