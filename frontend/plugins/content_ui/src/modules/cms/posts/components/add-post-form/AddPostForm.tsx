import { Form, ScrollArea } from 'erxes-ui';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
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
    handleLanguageChange: (lang: string) => void;
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
  const setCmsLanguage = useSetAtom(cmsLanguageAtom);
  const cmsLanguage = useAtomValue(cmsLanguageAtom);
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
    postUrlField,
    cmsConfig,
    fieldGroups,
  } = usePostData(websiteId, selectedType, currentEditingPost?._id);

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

  const formInitializedRef = useRef(false);

  const handleLanguageChangeRef = useRef<(lang: string) => void>(
    () => undefined,
  );

  const handleLanguageChangeStable = useCallback(
    (lang: string) => handleLanguageChangeRef.current(lang),
    [],
  );
  const isSwitchingLanguageRef = useRef(false);

  const finishLanguageSwitch = useCallback(() => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        isSwitchingLanguageRef.current = false;
      });
      return;
    }

    isSwitchingLanguageRef.current = false;
  }, []);

  const handlePostEditorChange = useCallback(
    (content: string) => {
      if (isSwitchingLanguageRef.current) return;

      handleEditorChange(content);
    },
    [handleEditorChange],
  );

  useEffect(() => {
    if (onFormReady && form && !formInitializedRef.current) {
      onFormReady({
        form,
        onSubmit,
        creating,
        saving,
        handleLanguageChange: handleLanguageChangeStable,
      });
      formInitializedRef.current = true;
    }
  }, [
    form,
    onSubmit,
    creating,
    saving,
    onFormReady,
    handleLanguageChangeStable,
  ]);

  // Helper: apply translation (or clear) translatable fields and save default data
  const applyTranslationToForm = useCallback(
    (lang: string) => {
      setDefaultLangData((current) => {
        if (current) return current;

        return {
          title: fullPost?.title || '',
          content: fullPost?.content || '',
          excerpt: fullPost?.excerpt || fullPost?.description || '',
          customFieldsData: fullPost?.customFieldsData || [],
        };
      });
      const translation = translations[lang];
      form.setValue('title', translation?.title || '');
      form.setValue('content', translation?.content || '');
      form.setValue('description', translation?.excerpt || '');
      form.setValue('customFieldsData', translation?.customFieldsData || []);
    },
    [form, fullPost, translations, setDefaultLangData],
  );

  useEffect(() => {
    if (!selectedLanguage && defaultLanguage) {
      const initialLang = cmsLanguage || defaultLanguage;
      // Set form values BEFORE setting selectedLanguage so the Editor
      // (which remounts on key change including selectedLanguage) reads
      // the correct values when it re-initialises.
      if (initialLang !== defaultLanguage) {
        isSwitchingLanguageRef.current = true;
        applyTranslationToForm(initialLang);
        finishLanguageSwitch();
      }
      setSelectedLanguage(initialLang);
    }
  }, [
    applyTranslationToForm,
    cmsLanguage,
    defaultLanguage,
    finishLanguageSwitch,
    selectedLanguage,
    setSelectedLanguage,
  ]);

  // When fullPost changes (loads twice: editingPost then fullPostData.cmsPost),
  // the hook's effect resets the form with default-lang data.  Re-apply the
  // translation override for the current non-default language.
  const appliedForPostRef = useRef<{
    post: unknown;
    language: string;
    translations: unknown;
  } | null>(null);
  useEffect(() => {
    if (
      !selectedLanguage ||
      !defaultLanguage ||
      selectedLanguage === defaultLanguage
    ) {
      return;
    }
    if (currentEditingPost && !fullPost) return;
    const post = fullPost ?? null;
    const applied = appliedForPostRef.current;

    if (
      applied?.post === post &&
      applied.language === selectedLanguage &&
      applied.translations === translations
    ) {
      return;
    }

    isSwitchingLanguageRef.current = true;
    applyTranslationToForm(selectedLanguage);
    finishLanguageSwitch();
    appliedForPostRef.current = {
      post,
      language: selectedLanguage,
      translations,
    };
  }, [
    applyTranslationToForm,
    defaultLanguage,
    finishLanguageSwitch,
    currentEditingPost,
    fullPost,
    selectedLanguage,
    translations,
  ]);

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
  }, [selectedType, currentEditingPost, form, previousTypeRef]);

  const handleLanguageChange = (lang: string) => {
    if (lang === selectedLanguage) return;

    isSwitchingLanguageRef.current = true;

    if (selectedLanguage === defaultLanguage) {
      setDefaultLangData({
        title: form.getValues('title') || '',
        content: form.getValues('content') || '',
        excerpt: form.getValues('description') || '',
        customFieldsData: form.getValues('customFieldsData') || [],
      });
    } else {
      setTranslations((prev) => ({
        ...prev,
        [selectedLanguage]: {
          title: form.getValues('title'),
          content: form.getValues('content'),
          excerpt: form.getValues('description'),
          customFieldsData: form.getValues('customFieldsData'),
        },
      }));
    }

    if (lang === defaultLanguage) {
      const data = defaultLangData || {
        title: fullPost?.title || '',
        content: fullPost?.content || '',
        excerpt: fullPost?.excerpt || fullPost?.description || '',
        customFieldsData: fullPost?.customFieldsData || [],
      };
      form.setValue('title', data.title);
      form.setValue('content', data.content);
      form.setValue('description', data.excerpt);
      form.setValue('customFieldsData', data.customFieldsData);
    } else {
      const translation = translations[lang];
      form.setValue('title', translation?.title || '');
      form.setValue('content', translation?.content || '');
      form.setValue('description', translation?.excerpt || '');
      form.setValue('customFieldsData', translation?.customFieldsData || []);
    }

    setSelectedLanguage(lang);
    setCmsLanguage(lang);
    finishLanguageSwitch();
  };

  // Keep ref in sync so the stable callback always delegates to latest logic
  handleLanguageChangeRef.current = handleLanguageChange;

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
              handleEditorChange={handlePostEditorChange}
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
              postUrlField={postUrlField}
              fullPost={fullPost}
              cmsConfig={cmsConfig}
              handleLanguageChange={handleLanguageChange}
            />
          </div>
        </div>
      </Form>
    </ScrollArea>
  );
};
