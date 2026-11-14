import type { TContactContentType } from '@/contacts/utils/contactDetailPath';
import { Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  PanelDescriptionField,
  useCompaniesEdit,
  useCustomerEdit,
} from 'ui-modules';
import { ContactDescriptionEditor } from './ContactDescriptionEditor';

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
  const { t } = useTranslation('contact', {
    keyPrefix: customer ? 'customer.add' : 'company',
  });
  const { customerEdit } = useCustomerEdit();
  const { companiesEdit } = useCompaniesEdit();

  const editorProps = {
    value,
    scope: `side-panel-${customer ? 'customer' : 'company'}.description`,
    onSave: (description: string) => {
      const variables = { _id: contentId, description };
      if (customer) {
        customerEdit({ variables });
      } else {
        companiesEdit({ variables });
      }
    },
  };

  return fullSize ? (
    <ContactDescriptionEditor {...editorProps} readonly={readonly} />
  ) : (
    <PanelDescriptionField
      {...editorProps}
      label={t('description', 'Description')}
    />
  );
};

/** The description editor as a full-size record tab. */
export const ContactPanelDescription = ({
  loading = false,
  ...props
}: IContactDescriptionProps & { loading?: boolean }) =>
  loading ? (
    <Spinner containerClassName="py-12" />
  ) : (
    <ContactDescriptionField {...props} fullSize />
  );
