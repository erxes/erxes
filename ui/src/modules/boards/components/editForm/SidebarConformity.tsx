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
    const { item, options, renderItems } = this.props;

    return (
      <RightContent>
        <CompanySection mainType={options.type} mainTypeId={item._id} />

        <CustomerSection mainType={options.type} mainTypeId={item._id} />

        {renderItems()}
      </RightContent>
    );
  }
}

export default SidebarConformity;
