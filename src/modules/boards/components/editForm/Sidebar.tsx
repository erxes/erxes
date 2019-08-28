import Button from 'modules/common/components/Button';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import CompanySection from 'modules/companies/components/common/CompanySection';
import CustomerSection from 'modules/customers/components/common/CustomerSection';
import PortableDeals from 'modules/deals/components/PortableDeals';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import PortableTasks from 'modules/tasks/components/PortableTasks';
import PortableTickets from 'modules/tickets/components/PortableTickets';
import React from 'react';
import { Watch } from '../../containers/editForm/';
import { RightContent } from '../../styles/item';
import { IItem, IOptions } from '../../types';

type Props = {
  item: IItem;
  assignedUserIds: string[];
  onChangeField?: (name: 'assignedUserIds', value: any) => void;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  sidebar?: () => React.ReactNode;
  options: IOptions;
};

class Sidebar extends React.Component<Props> {
  onChange = (type, value) => {
    const { onChangeField } = this.props;

    if (onChangeField) {
      onChangeField(type, value);
    }
  };

  renderDeal = ({ type, id }: { type: string; id: string }) => {
    if (type === 'deal') {
      return '';
    }

    return <PortableDeals mainType={type} mainTypeId={id} />;
  };

  renderTicket = ({ type, id }: { type: string; id: string }) => {
    if (type === 'ticket') {
      return '';
    }

    return <PortableTickets mainType={type} mainTypeId={id} />;
  };

  renderTask = ({ type, id }: { type: string; id: string }) => {
    if (type === 'task') {
      return '';
    }

    return <PortableTasks mainType={type} mainTypeId={id} />;
  };

  render() {
    const {
      item,
      copyItem,
      removeItem,
      sidebar,
      options,
      assignedUserIds
    } = this.props;

    const onClick = () => removeItem(item._id);
    const userOnChange = usrs => this.onChange('assignedUserIds', usrs);

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
        {sidebar && sidebar()}

        <CompanySection mainType={options.type} mainTypeId={item._id} />

        <CustomerSection mainType={options.type} mainTypeId={item._id} />

        {this.renderDeal({ type: options.type, id: item._id })}
        {this.renderTicket({ type: options.type, id: item._id })}
        {this.renderTask({ type: options.type, id: item._id })}

        <Watch item={item} options={options} />

        <Button icon="checked-1" onClick={copyItem}>
          Copy
        </Button>

        <Button icon="cancel-1" onClick={onClick}>
          Delete
        </Button>
      </RightContent>
    );
  }
}

export default Sidebar;
