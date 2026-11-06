import { RecordDetailLink } from '@/side-panel/components/RecordDetailLink';

// Preserve old contact links while opening their records in the global panel.
export const ContactDetailLink = (props: {
  queryKey: 'contactId' | 'companyId';
  contentType: 'core:customer' | 'core:company';
}) => <RecordDetailLink {...props} />;
