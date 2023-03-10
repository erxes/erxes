import { Button, ControlLabel, FormGroup, Icon, __ } from '@erxes/ui/src';
import { Columns, Column } from '@erxes/ui/src/styles/chooser';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import React from 'react';
import { SelectIndicatorGroups, SelectOperations } from '../../common/utils';
import { FormContainer, ListItem } from '../../styles';
import { LinkButton, ModalFooter } from '@erxes/ui/src/styles/main';

type Props = {
  cardId: string;
  cardType: string;
  closeModal: () => void;
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
    const { bulkItems } = this.state;

    const handleSelect = (values, name) => {
      const updateBulkItems = bulkItems.map(bulkItem =>
        bulkItem._id === item._id ? { ...bulkItem, [name]: values } : bulkItem
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
              <ControlLabel>{__('Groups')}</ControlLabel>
              <SelectIndicatorGroups
                label="Groups of Indicators"
                name="groupId"
                onSelect={handleSelect}
                initialValue={item.groupId || ''}
              />
            </FormGroup>
          </Column>
        </Columns>
      </ListItem>
    );
  }

  render() {
    const { bulkItems } = this.state;
    const { closeModal } = this.props;

    const save = e => {
      e.preventDefault();
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
          <Icon icon="plus-1" /> {__('Add group')}
        </LinkButton>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Close')}
          </Button>
          {!!bulkItems.length && (
            <Button type="submit" btnStyle="success" icon={'check-circle'}>
              {__('Save')}
            </Button>
          )}
        </ModalFooter>
      </form>
    );
  }
}
export default Form;
