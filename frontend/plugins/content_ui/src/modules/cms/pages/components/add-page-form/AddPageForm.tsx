import { Form, ScrollArea } from 'erxes-ui';
import { useLocation } from 'react-router-dom';
import { useEffect, useRef, useMemo } from 'react';
import { usePageForm } from './hooks/usePageForm';
import { usePageData } from './hooks/usePageData';
import { usePageSubmission } from './hooks/usePageSubmission';
import { PageEditorColumn } from './PageEditorColumn';
import { PageSidePanel } from './PageSidePanel';

interface AddPageFormProps {
  websiteId: string;
  editingPage?: any;
  onClose?: () => void;
  onFormReady?: (formState: {
    form: any;
    onSubmit: (data?: any) => Promise<void>;
    creating: boolean;
    saving: boolean;
  }) => void;
}

export const AddPageForm = ({
  websiteId,
  editingPage,
  onClose,
  onFormReady,
}: AddPageFormProps) => {
  const location = useLocation() as any;
  const currentEditingPage = editingPage || (location?.state?.page as any);

  const {
    form,
    selectedLanguage,
    setSelectedLanguage,
    translations,
    setTranslations,
    defaultLangData,
    setDefaultLangData,
    handleEditorChange,
    generateSlug,
    fullPage,
    updateCustomFieldValue,
    getCustomFieldValue,
  } = usePageForm(currentEditingPage);

  const { availableLanguages, defaultLanguage } = usePageData(websiteId);

  const languageOptions = useMemo(
    () =>
      availableLanguages.map((lang: string) => ({
        value: lang,
        label: lang.toUpperCase(),
        isDefault: lang === defaultLanguage,
        hasTranslation: translations[lang] && lang !== defaultLanguage,
      })),
    [availableLanguages, defaultLanguage, translations],
  );

  const { onSubmit, creating, saving } = usePageSubmission({
    websiteId,
    editingPage: currentEditingPage,
    onClose,
  });

  const formInitializedRef = useRef(false);

  useEffect(() => {
    if (onFormReady && form && !formInitializedRef.current) {
      onFormReady({ form, onSubmit, creating, saving });
      formInitializedRef.current = true;
    }
  }, [form, onSubmit, creating, saving, onFormReady]);

  useEffect(() => {
    if (!selectedLanguage && defaultLanguage)
      setSelectedLanguage(defaultLanguage);
  }, [defaultLanguage, selectedLanguage, setSelectedLanguage]);

  const handleLanguageChange = (lang: string) => {
    if (lang === selectedLanguage) return;

    if (selectedLanguage === defaultLanguage) {
      setDefaultLangData({
        name: form.getValues('name') || '',
        content: form.getValues('content') || '',
        description: form.getValues('description') || '',
        customFieldsData: form.getValues('customFieldsData') || [],
      });
    } else {
      setTranslations((prev) => ({
        ...prev,
        [selectedLanguage]: {
          title: form.getValues('name'),
          content: form.getValues('content'),
          excerpt: form.getValues('description'),
          customFieldsData: form.getValues('customFieldsData'),
        },
      }));
    }

    if (lang === defaultLanguage) {
      const data = defaultLangData || {
        name: fullPage?.name || '',
        content: fullPage?.content || '',
        description: fullPage?.description || '',
        customFieldsData: fullPage?.customFieldsData || [],
      };
      form.setValue('name', data.name);
      form.setValue('content', data.content);
      form.setValue('description', data.description);
      form.setValue('customFieldsData', data.customFieldsData);
    } else {
      const translation = translations[lang];
      form.setValue('name', translation?.title || '');
      form.setValue('content', translation?.content || '');
      form.setValue('description', translation?.excerpt || '');
      form.setValue('customFieldsData', translation?.customFieldsData || []);
    }

    setSelectedLanguage(lang);
  };

  return (
    <ScrollArea className="flex-auto" viewportClassName="p-4">
      <Form {...form}>
        <div className="flex flex-col w-full mb-4 px-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PageEditorColumn
              form={form}
              selectedLanguage={selectedLanguage}
              defaultLanguage={defaultLanguage}
              fullPage={fullPage}
              generateSlug={generateSlug}
              handleEditorChange={handleEditorChange}
            />
            <PageSidePanel
              form={form}
              websiteId={websiteId}
              currentPageId={currentEditingPage?._id}
              availableLanguages={availableLanguages}
              defaultLanguage={defaultLanguage}
              selectedLanguage={selectedLanguage}
              languageOptions={languageOptions}
              handleLanguageChange={handleLanguageChange}
            />
          </div>
        </div>
      </Form>
    </ScrollArea>
  );
};
