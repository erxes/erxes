import { Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCompanyEdit } from '~/modules/contacts/companies/useCompanies';
import { useCustomerEdit } from '~/modules/contacts/customers/useCustomers';
import type { TContactContentType } from '~/modules/contacts/utils/contactDetailPath';
import { PanelDescriptionEditor } from '../PanelDescriptionEditor';
import { PanelDescriptionField } from '../PanelDescriptionField';

interface IContactDescriptionProps {
  contentType: TContactContentType;
  contentId: string;
  value: string;
  readonly?: boolean;
}

/** Uses the same editor and save behavior in a compact panel and a full page. */
export const ContactDescriptionField = ({
  contentType,
  contentId,
  value,
  readonly,
  fullSize = false,
}: IContactDescriptionProps & { fullSize?: boolean }) => {
  const customer = contentType === 'core:customer';
  const { t } = useTranslation('contact', { keyPrefix: customer ? 'customer.add' : 'company' });
  const customerEdit = useCustomerEdit();
  const companyEdit = useCompanyEdit();

  const editorProps = {
    value,
    scope: `side-panel-${customer ? 'customer' : 'company'}.description`,
    onSave: (description: string) =>
      (customer ? customerEdit : companyEdit).mutate({
        id: contentId,
        description: description || null,
      }),
  };

  return fullSize ? (
    <PanelDescriptionEditor {...editorProps} readonly={readonly} />
  ) : (
    <PanelDescriptionField {...editorProps} label={t('description', 'Description')} />
  );
};

/** The description editor as a full-size record tab. */
export const ContactPanelDescription = ({
  loading = false,
  ...props
}: IContactDescriptionProps & { loading?: boolean }) =>
  loading ? <Spinner area="lg" /> : <ContactDescriptionField {...props} fullSize />;
