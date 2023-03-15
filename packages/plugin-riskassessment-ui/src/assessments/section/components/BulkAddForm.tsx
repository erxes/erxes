import {
  Button,
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
  SelectOperations,
  SelectRiskIndicator
} from '../../../common/utils';
import { FormContainer, ListItem } from '../../../styles';

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

  renderBulkItem(item) {
    const { cardId, cardType } = this.props;

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
              groupId: '',
              indicatorId: ''
            }
          : bulkItem
      );
      this.setState({ bulkItems: updateBulkItems });
    };

    const handleSelectedUsersbyGroup = () => {
      console.log('aasd');
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
              <ControlLabel>{__('Groups')}</ControlLabel>
              {item?.useIndicator ? (
                <SelectRiskIndicator
                  label="Select Indicators"
                  name="indicatorId"
                  onSelect={handleSelect}
                  initialValue={item?.indicatorId || ''}
                />
              ) : (
                <SelectIndicatorGroups
                  label="Groups of Indicators"
                  name="groupId"
                  onSelect={handleSelect}
                  initialValue={item.groupId || ''}
                />
              )}
            </FormGroup>
            {/* {item?.useSplitTeamMembers && (
              <SelectGroupsAssignedUsers
                cardId={cardId}
                cardType={cardType}
                handleSelect={handleSelectedUsersbyGroup}
                riskAssessmentId=""
                groups={[]}
              />
            )} */}
            <FormContainer row>
              <FormGroup>
                <FormControl
                  name="useIndicator"
                  componentClass="checkbox"
                  onClick={toggleBool}
                />
                <ControlLabel>{'Use Indicators'}</ControlLabel>
              </FormGroup>
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
      handleSave(bulkItems.map(({ _id, ...bulkItem }) => bulkItem));
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
