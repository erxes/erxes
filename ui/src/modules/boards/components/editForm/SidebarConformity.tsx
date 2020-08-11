import CompanySection from 'modules/companies/components/common/CompanySection';
import CustomerSection from 'modules/customers/components/common/CustomerSection';
import React from 'react';
import { RightContent } from '../../styles/item';
import { IItem, IOptions } from '../../types';

type Props = {
  item: IItem;
  saveItem: (doc: { [key: string]: any }) => void;
  options: IOptions;
  renderItems: () => React.ReactNode;
};

class SidebarConformity extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    if (nextProps.item.modifiedAt === this.props.item.modifiedAt) {
      return false;
    }
    return true;
  }

  render() {
    const { item, saveItem, options, renderItems } = this.props;

    const cmpsChange = cmps => saveItem({ companies: cmps });
    const cmrsChange = cmrs => saveItem({ customers: cmrs });

    return (
      <RightContent>
        <CompanySection
          mainType={options.type}
          mainTypeId={item._id}
          companies={item.companies}
          onSelect={cmpsChange}
        />

        <CustomerSection
          mainType={options.type}
          mainTypeId={item._id}
          customers={item.customers}
          onSelect={cmrsChange}
        />

        {renderItems()}
      </RightContent>
    );
  }
}

export default SidebarConformity;
