import { IItem, IOptions } from "../../types";

import ActionSection from "@erxes/ui-contacts/src/customers/containers/ActionSection";
import CompanySection from "@erxes/ui-contacts/src/companies/components/CompanySection";
import CustomerSection from "@erxes/ui-contacts/src/customers/components/CustomerSection";
import React from "react";

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
      <>
        <CompanySection mainType={options.type} mainTypeId={item._id} />
        <CustomerSection
          mainType={options.type}
          mainTypeId={item._id}
          actionSection={ActionSection}
        />
        {renderItems()}
      </>
    );
  }
}

export default SidebarConformity;
