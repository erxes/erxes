import { FullNameValue } from 'erxes-ui';
import { CustomerName, ICustomerDetail, PanelFieldTrigger } from 'ui-modules';

/** Edits the customer's name in place, the same way its table cell does. */
export const CustomerPanelName = ({
  customer,
}: {
  customer: ICustomerDetail;
}) => {
  const { _id, firstName, middleName, lastName } = customer;

  return (
    <CustomerName
      _id={_id}
      firstName={firstName || ''}
      lastName={`${middleName || ''}${middleName ? ' ' : ''}${lastName || ''}`}
      scope={`side-panel-customer.${_id}.name`}
    >
      {/* Keeps the cell's 32px height, which its editor's position assumes. */}
      <PanelFieldTrigger className="px-1 font-medium">
        <FullNameValue />
      </PanelFieldTrigger>
    </CustomerName>
  );
};
