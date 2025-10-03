import { DocumentEditor } from '@/documents/components/DocumentEditor';
import { Documents } from '@/documents/components/Documents';
import { DocumentsHeader } from '@/documents/components/DocumentsHeader';
import { DocumentsLayout } from '@/documents/components/DocumentsLayout';
import { DocumentsTypes } from '@/documents/components/DocumentsTypes';
import { useDocumentForm } from '@/documents/hooks/useDocumentForm';
import { PageContainer } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';

const DocumentsIndexPage = () => {
  const { form } = useDocumentForm();

  return (
    <PageContainer>
      <FormProvider {...form}>
        <DocumentsHeader />
        <DocumentsLayout
          Documents={Documents}
          DocumentsTypes={DocumentsTypes}
          Editor={DocumentEditor}
        />
      </FormProvider>
    </PageContainer>
  );
};

export default DocumentsIndexPage;
