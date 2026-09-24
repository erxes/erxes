import { Button, Form, ScrollArea, Sheet } from 'erxes-ui';
import { useLocation, useSearchParams } from 'react-router-dom';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PostizDeliveryList } from '../../postiz/PostizDeliveryList';
import { useSetAtom, useAtomValue } from 'jotai';
import { usePostForm } from './hooks/usePostForm';
import { usePostData } from './hooks/usePostData';
import { usePostSubmission } from './hooks/usePostSubmission';
import { usePostAutosave } from './hooks/usePostAutosave';
import { PostEditorColumn } from './PostEditorColumn';
import { PostSidebarPanel } from './PostSidebarPanel';
import { PostComments } from '../PostComments';
import { PostRatings } from '../PostRatings';
import { cmsLanguageAtom } from '~/modules/cms/shared/states/cmsLanguageState';
import { CmsUnsavedChangesAlert } from '~/modules/cms/shared/components/CmsUnsavedChangesAlert';

// A post being edited: only _id matters here, everything else is read via
// the detail query inside usePostForm.
type TEditingPost = { _id: string };

interface AddPostFormProps {
  websiteId: string;
  editingPost?: TEditingPost;
  onClose?: () => void;
  onFormReady?: (formState: {
    form: UseFormReturn<FieldValues>;
    onSubmit: (data?: FieldValues) => Promise<void>;
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
  const { t } = useTranslation('content');
  const [showDeliveries, setShowDeliveries] = useState(false);
  const location = useLocation();
  const locationState = (location.state ?? null) as {
    post?: TEditingPost;
  } | null;
  const [searchParams] = useSearchParams();
  const setCmsLanguage = useSetAtom(cmsLanguageAtom);
  const cmsLanguage = useAtomValue(cmsLanguageAtom);
  const currentEditingPost = editingPost || locationState?.post;

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

  // After a successful save, re-baseline the form's default values to the
  // saved snapshot (keeping current values) so edits made while the save was
  // in flight stay dirty. When the save navigates away right after (non-silent
  // saves), also stand the guard down via the bypass ref: the reset and the
  // navigation happen in the same tick, before the blocker re-renders, so its
  // captured isDirty would still be stale `true`.
  const guardBypassRef = useRef(false);
  const handleSaved = useCallback(
    (savedData: unknown, { navigating }: { navigating: boolean }) => {
      form.reset(savedData as Parameters<typeof form.reset>[0], {
        keepValues: true,
      });

      if (navigating) {
        guardBypassRef.current = true;
      }
    },
    [form],
  );

  const { onSubmit, creating, saving, postizSheet } = usePostSubmission({
    websiteId,
    editingPost: currentEditingPost,
    selectedLanguage,
    defaultLanguage,
    defaultLangData,
    translations,
    onClose,
    onSaved: handleSaved,
  });

  // Same safe widening as formForColumns below — the hook only reads known fields.
  usePostAutosave({
    form: form as unknown as UseFormReturn<FieldValues>,
    enabled: Boolean(currentEditingPost?._id),
    save: onSubmit as unknown as (
      data: FieldValues,
      options: { silent: boolean },
    ) => Promise<void>,
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
      // Same safe widening as formForColumns — consumers only read known fields.
      onFormReady({
        form: form as unknown as UseFormReturn<FieldValues>,
        onSubmit: onSubmit as unknown as (data?: FieldValues) => Promise<void>,
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

  // Mirror the form's active language into the shared atom (one-way). The header
  // language tabs read this atom for their active state, so this keeps the tab
  // highlight in lockstep with the language the form is actually showing.
  useEffect(() => {
    if (selectedLanguage) {
      setCmsLanguage(selectedLanguage);
    }
  }, [selectedLanguage, setCmsLanguage]);

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
      applied !== null &&
      applied.post === post &&
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
    const matched = customTypes.find(
      (t: { _id: string; code?: string }) => t.code === typeCode,
    );
    if (matched) form.setValue('type', matched._id);
  }, [customTypes, currentEditingPost, form, searchParams]);

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
          title: form.getValues('title') || '',
          content: form.getValues('content') || '',
          excerpt: form.getValues('description') || '',
          customFieldsData: form.getValues('customFieldsData') || [],
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
    finishLanguageSwitch();
  };

  // Keep ref in sync so the stable callback always delegates to latest logic
  handleLanguageChangeRef.current = handleLanguageChange;

  // The child columns type `form` loosely as UseFormReturn<FieldValues>; our form
  // is the more specific UseFormReturn<PostFormData>, which RHF treats as
  // incompatible. They only read/write known fields, so the widening is safe.
  const formForColumns = form as unknown as UseFormReturn<FieldValues>;

  return (
    <ScrollArea className="flex-auto" viewportClassName="p-4">
      {postizSheet}
      {currentEditingPost?._id &&
        fullPost?.type === 'post' &&
        fullPost.status === 'published' && (
          <>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 mb-4"
              onClick={() => setShowDeliveries(true)}
            >
              {t('cms-social-history', {
                defaultValue: 'Social delivery history',
              })}
            </Button>
            <Sheet open={showDeliveries} onOpenChange={setShowDeliveries}>
              <Sheet.View className="w-[calc(100vw-1rem)] sm:max-w-lg p-0 flex flex-col">
                <Sheet.Header className="h-auto items-start py-4 gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Sheet.Title>
                      {t('cms-social-history', {
                        defaultValue: 'Social delivery history',
                      })}
                    </Sheet.Title>
                    <Sheet.Description>
                      {t('cms-social-history-description', {
                        defaultValue:
                          'Shares for this CMS post and selected language.',
                      })}
                    </Sheet.Description>
                  </div>
                  <Sheet.Close
                    aria-label={t('close', { defaultValue: 'Close' })}
                    className="min-h-11 min-w-11"
                  />
                </Sheet.Header>
                <Sheet.Content className="overflow-y-auto p-4">
                  <PostizDeliveryList
                    postId={currentEditingPost._id}
                    language={selectedLanguage || defaultLanguage || 'en'}
                  />
                </Sheet.Content>
              </Sheet.View>
            </Sheet>
          </>
        )}
      <CmsUnsavedChangesAlert
        isDirty={form.formState.isDirty}
        bypassRef={guardBypassRef}
      />
      <Form {...form}>
        <div className="flex flex-col w-full mb-4 px-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PostEditorColumn
              form={formForColumns}
              selectedLanguage={selectedLanguage}
              defaultLanguage={defaultLanguage}
              selectedType={selectedType}
              fieldGroups={fieldGroups}
              websiteId={websiteId}
              fullPost={fullPost}
              handleEditorChange={handlePostEditorChange}
              getCustomFieldValue={getCustomFieldValue}
              updateCustomFieldValue={updateCustomFieldValue}
            />
            <PostSidebarPanel
              form={formForColumns}
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
      {currentEditingPost?._id && (
        <>
          <PostRatings
            postId={currentEditingPost._id}
            clientPortalId={websiteId}
            allowRatings={cmsConfig?.allowRatings}
          />
          <PostComments
            postId={currentEditingPost._id}
            clientPortalId={websiteId}
            allowComments={cmsConfig?.allowComments}
          />
        </>
      )}
    </ScrollArea>
  );
};
