import { useTranslation } from 'react-i18next';
import { ContactLinks } from '~/modules/contacts/components/ContactLinks';
import { ContactDetailSection } from './ContactDetailSection';

type TContactType = 'core:customer' | 'core:company';

/** A person's companies or a company's people, with each link's role, main contact and former status. */
export const ContactPanelRelationField = ({
  contentType,
  contentId,
}: {
  contentType: TContactType;
  contentId: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    <ContactDetailSection
      title={contentType === 'core:customer' ? t('companies', 'Companies') : t('people', 'People')}
    >
      <ContactLinks side={contentType} id={contentId} />
    </ContactDetailSection>
  );
};
