import ChecklistAdd from 'modules/checklists/components/AddButton';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import CompanySection from 'modules/companies/components/common/CompanySection';
import CustomerSection from 'modules/customers/components/common/CustomerSection';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import Watch from '../../containers/editForm/Watch';
import LabelChooser from '../../containers/label/LabelChooser';
import { Actions, RightButton, RightContent } from '../../styles/item';
import { IItem, IOptions } from '../../types';

type Props = {
  item: IItem;
  saveItem: (doc: { [key: string]: any }) => void;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  sidebar?: (
    saveItem?: (doc: { [key: string]: any }) => void
  ) => React.ReactNode;
  options: IOptions;
  renderItems: () => React.ReactNode;
};

class Sidebar extends React.Component<Props> {
  render() {
    const {
      item,
      copyItem,
      removeItem,
      saveItem,
      sidebar,
      options,
      renderItems
    } = this.props;

    const onClick = () => removeItem(item._id);
    const userOnChange = usrs => saveItem({ assignedUserIds: usrs });
    const cmpsChange = cmps => saveItem({ companies: cmps });
    const cmrsChange = cmrs => saveItem({ customers: cmrs });
    const onLabelChange = labels => saveItem({ labels });
    const assignedUserIds = (item.assignedUsers || []).map(user => user._id);

    return (
      <RightContent>
        <FormGroup>
          <ControlLabel>Assigned to</ControlLabel>
          <SelectTeamMembers
            label="Choose users"
            name="assignedUserIds"
            value={assignedUserIds}
            onSelect={userOnChange}
            filterParams={{ status: 'verified' }}
          />
        </FormGroup>

        <Actions>
          <ControlLabel>Add to card</ControlLabel>
          <LabelChooser item={item} onSelect={onLabelChange} />

          <ChecklistAdd itemId={item._id} type={options.type} />
        </Actions>

        {sidebar && sidebar(saveItem)}

        <CompanySection
          mainType={options.type}
          mainTypeId={item._id}
          onSelect={cmpsChange}
        />

        <CustomerSection
          mainType={options.type}
          mainTypeId={item._id}
          onSelect={cmrsChange}
        />

        {renderItems()}

        <ControlLabel>Actions</ControlLabel>
        <Watch item={item} options={options} />

        <RightButton icon="copy-1" onClick={copyItem}>
          Copy
        </RightButton>

        <RightButton icon="trash-4" onClick={onClick}>
          Delete
        </RightButton>
      </RightContent>
    );
  }
}

export default Sidebar;
