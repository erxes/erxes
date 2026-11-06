import { PanelAvatarPopover } from '@/side-panel/components/details/PanelAvatarField';
import type { ReactNode } from 'react';
import {
  ICompany,
  ICustomerDetail,
  useCompaniesEdit,
  useCustomerEdit,
} from 'ui-modules';

/** Edits a customer's picture from the avatar in the panel's bar. */
export const CustomerPanelAvatar = ({
  customer,
  children,
}: {
  customer: ICustomerDetail;
  children: ReactNode;
}) => {
  const { customerEdit } = useCustomerEdit();

  return (
    <PanelAvatarPopover
      value={customer.avatar || ''}
      onSave={(avatar) =>
        customerEdit({ variables: { _id: customer._id, avatar } })
      }
    >
      {children}
    </PanelAvatarPopover>
  );
};

/** Edits a company's picture from the avatar in the panel's bar. */
export const CompanyPanelAvatar = ({
  company,
  children,
}: {
  company: ICompany;
  children: ReactNode;
}) => {
  const { companiesEdit } = useCompaniesEdit();

  return (
    <PanelAvatarPopover
      value={company.avatar || ''}
      onSave={(avatar) =>
        companiesEdit({ variables: { _id: company._id, avatar } })
      }
    >
      {children}
    </PanelAvatarPopover>
  );
};
