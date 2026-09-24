import { useEmailTemplatesLayout } from '@/emailTemplates/components/EmailTemplatesDisplayControl';
import { EmailTemplatesGrid } from '@/emailTemplates/components/EmailTemplatesGrid';
import { EmailTemplatesSubHeader } from '@/emailTemplates/components/EmailTemplatesSubHeader';
import { EmailTemplatesTable } from '@/emailTemplates/components/EmailTemplatesTable';

export const EmailTemplatesSettings = () => {
  const { layout } = useEmailTemplatesLayout();

  return (
    <>
      <EmailTemplatesSubHeader />
      {layout === 'grid' ? <EmailTemplatesGrid /> : <EmailTemplatesTable />}
    </>
  );
};
