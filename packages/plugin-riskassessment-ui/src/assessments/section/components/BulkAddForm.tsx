import {
  Button,
  confirm,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  __
} from '@erxes/ui/src';
import { Column, Columns } from '@erxes/ui/src/styles/chooser';
import { LinkButton, ModalFooter } from '@erxes/ui/src/styles/main';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import React from 'react';
import {
  SelectIndicatorGroups,
  SelectIndicators,
  SelectOperations
} from '../../../common/utils';
import { FormContainer, ListItem } from '../../../styles';
import { SelectGroupsAssignedUsersWrapper } from '../common/utils';

type Props = {
  cardId: string;
  cardType: string;
  closeModal: () => void;
  handleSave: (bulkItems: any[]) => void;
};

type State = {
  bulkItems: any[];
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      bulkItems: []
    };
  }

  renderSplitAssignedUsers(item) {
    const { cardId, cardType } = this.props;

    if (!item?.useSplitTeamMembers || !item.groupId) {
      return;
    }

    const handleSelectedUsersbyGroup = groupsAssignedUsers => {
      const updateBulkItems = this.state.bulkItems.map(bulkItem =>
        bulkItem._id === item._id
          ? { ...bulkItem, groupsAssignedUsers }
          : bulkItem
      );
      this.setState({ bulkItems: updateBulkItems });
    };

    return (
      <SelectGroupsAssignedUsersWrapper
        _id={item.groupId}
        cardId={cardId}
        cardType={cardType}
        handleSelect={handleSelectedUsersbyGroup}
      />
    );
  }

  renderBulkItem(item) {
    const { bulkItems } = this.state;

    const handleSelect = (values, name) => {
      const updateBulkItems = bulkItems.map(bulkItem =>
        bulkItem._id === item._id ? { ...bulkItem, [name]: values } : bulkItem
      );
      this.setState({ bulkItems: updateBulkItems });
    };

    const toggleBool = e => {
      const { name } = e.currentTarget as HTMLInputElement;

      const updateBulkItems = bulkItems.map(bulkItem =>
        bulkItem._id === item._id
          ? {
              ...bulkItem,
              [name]: !bulkItem[name],
              groupId: name === 'useSplitTeamMembers' ? bulkItem.groupId : '',
              indicatorId: ''
            }
          : bulkItem
      );
      this.setState({ bulkItems: updateBulkItems });
    };

    return (
      <ListItem key={item._id}>
        <Columns>
          <Column>
            <FormContainer row gap flex>
              <FormGroup>
                <ControlLabel>{__('Branches')}</ControlLabel>
                <SelectBranches
                  name="branchIds"
                  label="Select Branches"
                  initialValue={item?.branchIds || []}
                  onSelect={handleSelect}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__('Department')}</ControlLabel>
                <SelectDepartments
                  name="departmentIds"
                  label="Select Departments"
                  initialValue={item?.departmentIds || []}
                  onSelect={handleSelect}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__('Operations')}</ControlLabel>
                <SelectOperations
                  name="operationIds"
                  label="Select Operations"
                  initialValue={item?.operationIds || []}
                  multi={true}
                  onSelect={handleSelect}
                />
              </FormGroup>
            </FormContainer>
          </Column>
          <Column>
            <FormGroup>
              <ControlLabel>
                {__(item?.useIndicator ? 'Indicators' : 'Groups')}
              </ControlLabel>
              {item?.useIndicator ? (
                <SelectIndicators
                  label="Select Indicators"
                  name="indicatorId"
                  onSelect={handleSelect}
                  initialValue={item?.indicatorId || ''}
                  customOption={{ label: 'Choose Groups', value: '' }}
                />
              ) : (
                <SelectIndicatorGroups
                  label="Groups of Indicators"
                  name="groupId"
                  onSelect={handleSelect}
                  initialValue={item.groupId || ''}
                  customOption={{ label: 'Choose Groups', value: '' }}
                />
              )}
            </FormGroup>
            {this.renderSplitAssignedUsers(item)}
            <FormContainer row>
              <FormGroup>
                <FormControl
                  name="useIndicator"
                  componentClass="checkbox"
                  onClick={toggleBool}
                />
                <ControlLabel>{'Use Indicators'}</ControlLabel>
              </FormGroup>
              {!item.useIndicator && (
                <FormGroup>
                  <FormControl
                    name="useSplitTeamMembers"
                    componentClass="checkbox"
                    onClick={toggleBool}
                  />
                  <ControlLabel>
                    {'Split assigned team members to groups'}
                  </ControlLabel>
                </FormGroup>
              )}
            </FormContainer>
          </Column>
        </Columns>
      </ListItem>
    );
  }

  render() {
    const { bulkItems } = this.state;
    const { closeModal, handleSave } = this.props;

    const save = e => {
      e.preventDefault();
      handleSave(
        bulkItems.map(
          ({ _id, useIndicator, useSplitTeamMembers, ...bulkItem }) => bulkItem
        )
      );
    };

    const addBulkItem = () => {
      const variables = {
        _id: Math.random(),
        branchIds: [],
        departmentIds: [],
        operationIds: [],
        groupId: ''
      };

      this.setState({ bulkItems: [...bulkItems, variables] });
    };

    return (
      <form onSubmit={save}>
        {bulkItems.map(bulkItem => this.renderBulkItem(bulkItem))}
        <LinkButton onClick={addBulkItem}>
          <Icon icon="plus-1" /> {__('Add')}
        </LinkButton>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Close')}
          </Button>
          {!!bulkItems.length && (
            <Button
              type="submit"
              btnStyle="success"
              icon={'check-circle'}
              onClick={save}
            >
              {__('Save')}
            </Button>
          )}
        </ModalFooter>
      </form>
    );
  }
}
export default Form;
