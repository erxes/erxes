import { DocumentEditor } from '@/documents/components/DocumentEditor';
import { Documents } from '@/documents/components/Documents';
import { DocumentsFilter } from '@/documents/components/DocumentsFilter';
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
        <DocumentsFilter />
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
