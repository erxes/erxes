import { Form, ScrollArea } from 'erxes-ui';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useMemo } from 'react';
import { useAtom } from 'jotai';
import { usePostForm } from './hooks/usePostForm';
import { usePostData } from './hooks/usePostData';
import { usePostSubmission } from './hooks/usePostSubmission';
import { PostEditorColumn } from './PostEditorColumn';
import { PostSidebarPanel } from './PostSidebarPanel';
import { cmsLanguageAtom } from '~/modules/cms/shared/states/cmsLanguageState';

interface AddPostFormProps {
  websiteId: string;
  editingPost?: any;
  onClose?: () => void;
  onFormReady?: (formState: {
    form: any;
    onSubmit: (data?: any) => Promise<void>;
    creating: boolean;
    saving: boolean;
  }) => void;
}

export const AddPostForm = ({
  websiteId,
  editingPost,
  onClose,
  onFormReady,
}: AddPostFormProps) => {
  const location = useLocation() as any;
  const [searchParams] = useSearchParams();
  const currentEditingPost = editingPost || (location?.state?.post as any);

  const {
    form,
    selectedLanguage,
    setSelectedLanguage,
    translations,
    setTranslations,
    defaultLangData,
    setDefaultLangData,
    previousTypeRef,
    handleEditorChange,
    generateSlug,
    fullPost,
    updateCustomFieldValue,
    getCustomFieldValue,
  } = usePostForm(currentEditingPost);

  const selectedType = form.watch('type');

  const {
    categories,
    tags,
    customTypes,
    availableLanguages,
    defaultLanguage,
    fieldGroups,
  } = usePostData(websiteId, selectedType);

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

  const { onSubmit, creating, saving } = usePostSubmission({
    websiteId,
    editingPost: currentEditingPost,
    selectedLanguage,
    defaultLanguage,
    defaultLangData,
    translations,
    onClose,
  });

  const [globalLanguage, setGlobalLanguage] = useAtom(cmsLanguageAtom);

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

  useEffect(() => {
    if (currentEditingPost || !customTypes.length) return;
    const typeCode = searchParams.get('type');
    if (!typeCode || typeCode === 'post') return;
    const matched = customTypes.find((t: any) => t.code === typeCode);
    if (matched) form.setValue('type', matched._id);
  }, [customTypes]);

  useEffect(() => {
    if (
      !currentEditingPost &&
      selectedType &&
      previousTypeRef.current &&
      previousTypeRef.current !== selectedType
    ) {
      form.setValue('customFieldsData', []);
    }
    previousTypeRef.current = selectedType;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, currentEditingPost]);

  const handleLanguageChange = (lang: string) => {
    if (lang === selectedLanguage) return;

    if (selectedLanguage === defaultLanguage) {
      setDefaultLangData({
        title: form.getValues('title') || '',
        content: form.getValues('content') || '',
        description: form.getValues('description') || '',
        customFieldsData: form.getValues('customFieldsData') || [],
      });
    } else {
      setTranslations((prev) => ({
        ...prev,
        [selectedLanguage]: {
          title: form.getValues('title'),
          content: form.getValues('content'),
          description: form.getValues('description'),
          customFieldsData: form.getValues('customFieldsData'),
        },
      }));
    }

    if (lang === defaultLanguage) {
      const data = defaultLangData || {
        title: fullPost?.title || '',
        content: fullPost?.content || '',
        description: fullPost?.excerpt || fullPost?.description || '',
        customFieldsData: fullPost?.customFieldsData || [],
      };
      form.setValue('title', data.title);
      form.setValue('content', data.content);
      form.setValue('description', data.description);
      form.setValue('customFieldsData', data.customFieldsData);
    } else {
      const translation = translations[lang];
      form.setValue('title', translation?.title || '');
      form.setValue('content', translation?.content || '');
      form.setValue('description', translation?.description || '');
      form.setValue('customFieldsData', translation?.customFieldsData || []);
    }

    setSelectedLanguage(lang);
    setGlobalLanguage(lang);
  };

  // Sync: when header language tabs change the global atom, trigger local switch
  const handleLanguageChangeRef = useRef(handleLanguageChange);
  handleLanguageChangeRef.current = handleLanguageChange;

  useEffect(() => {
    if (
      globalLanguage &&
      selectedLanguage &&
      globalLanguage !== selectedLanguage &&
      availableLanguages.includes(globalLanguage)
    ) {
      handleLanguageChangeRef.current(globalLanguage);
    }
  }, [globalLanguage, selectedLanguage, availableLanguages]);

  // Late hydration: when translations or fullPost load while on a non-default
  // language, push translation data into the form (or clear it if none exists).
  // This guards against form.reset() in usePostForm overwriting with default
  // language data after fullPost loads.
  useEffect(() => {
    if (
      selectedLanguage &&
      defaultLanguage &&
      selectedLanguage !== defaultLanguage
    ) {
      const translation = translations[selectedLanguage];
      form.setValue('title', translation?.title || '');
      form.setValue('content', translation?.content || '');
      form.setValue('description', translation?.description || '');
      form.setValue('customFieldsData', translation?.customFieldsData || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translations, fullPost]);

  return (
    <ScrollArea className="flex-auto" viewportClassName="p-4">
      <Form {...form}>
        <div className="flex flex-col w-full mb-4 px-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PostEditorColumn
              form={form}
              selectedLanguage={selectedLanguage}
              defaultLanguage={defaultLanguage}
              selectedType={selectedType}
              fieldGroups={fieldGroups}
              fullPost={fullPost}
              generateSlug={generateSlug}
              handleEditorChange={handleEditorChange}
              getCustomFieldValue={getCustomFieldValue}
              updateCustomFieldValue={updateCustomFieldValue}
            />
            <PostSidebarPanel
              form={form}
              categories={categories}
              tags={tags}
              customTypes={customTypes}
              websiteId={websiteId}
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
