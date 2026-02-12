import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Input,
  Textarea,
  Editor,
  Button,
  Tabs,
  toast,
  Spinner,
  Form,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import {
  CMS_TRANSLATIONS,
  CMS_ADD_TRANSLATION,
  CMS_EDIT_TRANSLATION,
} from '../graphql/queries';
import { formatInitialContent } from './formHelpers';
import { Block } from '@blocknote/core';

interface Translation {
  _id?: string;
  postId: string;
  language: string;
  title: string;
  content: string;
  excerpt: string;
  customFieldsData?: any;
}

interface TranslationEditorProps {
  postId: string;
  languages: string[];
  defaultLanguage?: string;
}

export function TranslationEditor({
  postId,
  languages,
  defaultLanguage = 'en',
}: TranslationEditorProps) {
  const [activeLanguage, setActiveLanguage] = useState<string>(
    languages[0] || defaultLanguage,
  );
  const [translations, setTranslations] = useState<Record<string, Translation>>(
    {},
  );

  const form = useForm<Translation>({
    defaultValues: {
      postId,
      language: activeLanguage,
      title: '',
      content: '',
      excerpt: '',
    },
  });

  const { data: translationsData, loading: loadingTranslations } = useQuery(
    CMS_TRANSLATIONS,
    {
      variables: { postId },
      skip: !postId,
      fetchPolicy: 'network-only',
    },
  );

  const [addTranslation, { loading: adding }] =
    useMutation(CMS_ADD_TRANSLATION);
  const [editTranslation, { loading: editing }] =
    useMutation(CMS_EDIT_TRANSLATION);

  useEffect(() => {
    if (translationsData?.cmsTranslations) {
      const translationsMap: Record<string, Translation> = {};
      translationsData.cmsTranslations.forEach((t: Translation) => {
        translationsMap[t.language] = t;
      });
      setTranslations(translationsMap);
    }
  }, [translationsData]);

  useEffect(() => {
    const currentTranslation = translations[activeLanguage];
    if (currentTranslation) {
      form.reset({
        postId,
        language: activeLanguage,
        title: currentTranslation.title || '',
        content: currentTranslation.content || '',
        excerpt: currentTranslation.excerpt || '',
      });
    } else {
      form.reset({
        postId,
        language: activeLanguage,
        title: '',
        content: '',
        excerpt: '',
      });
    }
  }, [activeLanguage, translations, postId, form]);

  const handleEditorChange = async (value: string, editorInstance?: any) => {
    try {
      if (typeof value === 'string' && value.trim().startsWith('[')) {
        const blocks: Block[] = JSON.parse(value);
        if (editorInstance?.blocksToHTMLLossy) {
          const htmlContent = await editorInstance.blocksToHTMLLossy(
            blocks as any,
          );
          form.setValue('content', htmlContent, {
            shouldDirty: true,
            shouldTouch: true,
          });
        } else {
          const htmlContent = (blocks as any)
            .map((block: any) => {
              if (block.type === 'paragraph' && block.content) {
                const text = block.content
                  .map((i: any) => i.text || '')
                  .join('');
                return text ? `<p>${text}</p>` : '';
              }
              if (block.type === 'heading' && block.content) {
                const text = block.content
                  .map((i: any) => i.text || '')
                  .join('');
                const level = (block.props as any)?.level || 1;
                return text ? `<h${level}>${text}</h${level}>` : '';
              }
              return '';
            })
            .filter(Boolean)
            .join('');
          form.setValue('content', htmlContent, {
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      } else {
        const htmlContent = value || '';
        form.setValue('content', htmlContent, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    } catch {
      form.setValue('content', '', { shouldDirty: true, shouldTouch: true });
    }
  };

  const onSubmit = async (data: Translation) => {
    try {
      const input = {
        postId: data.postId,
        language: activeLanguage,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
      };

      const existingTranslation = translations[activeLanguage];

      if (existingTranslation) {
        await editTranslation({ variables: { input } });
        toast({
          title: 'Success',
          description: `Translation for ${activeLanguage} updated`,
        });
      } else {
        await addTranslation({ variables: { input } });
        toast({
          title: 'Success',
          description: `Translation for ${activeLanguage} added`,
        });
      }

      // Update local state
      setTranslations((prev) => ({
        ...prev,
        [activeLanguage]: { ...input, _id: existingTranslation?._id },
      }));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save translation',
        variant: 'destructive',
      });
    }
  };

  if (loadingTranslations) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="md" />
        <span className="ml-2">Loading translations...</span>
      </div>
    );
  }

  if (languages.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No languages configured for this CMS. Please add languages in the CMS
        settings.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Translations</h3>
        <Button
          onClick={() => form.handleSubmit(onSubmit)()}
          disabled={adding || editing}
          size="sm"
        >
          {adding || editing ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Translation'
          )}
        </Button>
      </div>

      <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
        <Tabs.List>
          {languages.map((lang) => (
            <Tabs.Trigger key={lang} value={lang}>
              {lang.toUpperCase()}
              {translations[lang] && (
                <span className="ml-1 text-xs text-green-600">✓</span>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {languages.map((lang) => (
          <Tabs.Content key={lang} value={lang}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <Form.Field
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Title ({lang})</Form.Label>
                      <Form.Control>
                        <Input {...field} placeholder={`Title in ${lang}`} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Excerpt ({lang})</Form.Label>
                      <Form.Control>
                        <Textarea
                          {...field}
                          placeholder={`Excerpt in ${lang}`}
                          rows={3}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="content"
                  render={() => (
                    <Form.Item>
                      <Form.Label>Content ({lang})</Form.Label>
                      <Form.Control>
                        <Editor
                          key={`editor-${lang}-${postId}`}
                          initialContent={formatInitialContent(
                            form.getValues('content') || '',
                          )}
                          onChange={handleEditorChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </form>
            </Form>
          </Tabs.Content>
        ))}
      </Tabs>
    </div>
  );
}
