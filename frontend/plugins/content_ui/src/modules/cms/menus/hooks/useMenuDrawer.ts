import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { cmsLanguageAtom } from '../../shared/states/cmsLanguageState';
import { useCmsTranslation } from '../../shared/hooks/useCmsTranslation';
import {
  CMS_MENU_ADD,
  CMS_MENU_EDIT,
  CMS_MENU_LIST,
  CONTENT_CMS_LIST,
} from '../../graphql/queries';
import { buildFlatTree, getDepthPrefix, RawMenuItem } from '../menuUtils';
import {
  MENU_PAGES_QUERY,
  MENU_POSTS_QUERY,
  MENU_CUSTOM_TYPES_QUERY,
  MENU_CATEGORIES_QUERY,
  MENU_TAGS_QUERY,
  MENU_DETECT_QUERY,
} from '../graphql/menuDrawerQueries';
import {
  CmsConfig,
  GraphQLErrorEntry,
  MenuContentItem,
  MenuCustomType,
  MenuDrawerProps,
  MenuFormData,
  MenuInput,
  TranslationInput,
} from '../types/menuDrawerTypes';
import { TranslationData } from '../../shared/hooks/useCmsTranslation';

const BUILT_IN_LINK_TYPES = ['url', 'page', 'post', 'category', 'tag'];

export function detectLinkType(url: string): string {
  if (!url) return 'url';
  if (url.startsWith('/category/')) return 'category';
  if (url.startsWith('/tag/')) return 'tag';
  return 'url';
}

function resolveMainLabel(
  currentLabel: string,
  isCreating: boolean,
  isNonDefaultLang: boolean,
  defaultLangData: TranslationData | null,
): string {
  if (isCreating && isNonDefaultLang) {
    return defaultLangData?.title || '';
  }
  return currentLabel;
}

function resolveLanguage(
  selectedLanguage: string,
  defaultLanguage: string,
  isCreating: boolean,
  isNonDefaultLang: boolean,
): string {
  return isCreating && isNonDefaultLang ? defaultLanguage : selectedLanguage;
}

function buildMenuTranslations(
  translations: Record<string, TranslationData>,
  defaultLanguage: string,
  selectedLanguage: string,
  currentLabel: string,
  isCreating: boolean,
  isNonDefaultLang: boolean,
): TranslationInput[] {
  const entries: TranslationInput[] = [];

  for (const [lang, tData] of Object.entries(translations)) {
    if (lang === defaultLanguage || lang === selectedLanguage) continue;
    if (tData.title) {
      entries.push({ language: lang, title: tData.title || '', type: 'menu' });
    }
  }

  if (isCreating && isNonDefaultLang) {
    entries.push({ language: selectedLanguage, title: currentLabel, type: 'menu' });
  }

  return entries;
}

export function useMenuDrawer({ isOpen, onClose, onSuccess, clientPortalId, menu }: MenuDrawerProps) {
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const isEditing = Boolean(menu?._id);
  const cmsLanguage = useAtomValue(cmsLanguageAtom);
  const setCmsLanguage = useSetAtom(cmsLanguageAtom);

  const { data: cmsData } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
    skip: !clientPortalId,
  });

  const cmsConfig = cmsData?.contentCMSList?.find(
    (cms: CmsConfig) => cms.clientPortalId === clientPortalId,
  );
  const availableLanguages: string[] = cmsConfig?.languages || [];
  const defaultLanguage: string = cmsConfig?.language || 'en';

  const {
    selectedLanguage,
    isTranslationMode,
    languageOptions,
    handleLanguageChange,
    defaultLangData,
    translations,
  } = useCmsTranslation({
    objectId: menu?._id,
    type: 'menu',
    availableLanguages,
    defaultLanguage,
    resetKey: isOpen,
  });

  const form = useForm<MenuFormData>({
    defaultValues: {
      label: '',
      url: '',
      kind: '',
      clientPortalId,
      parentId: '',
      linkType: 'url',
      target: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        label: menu?.label || '',
        url: menu?.url || '',
        kind: menu?.kind || '',
        clientPortalId,
        parentId: menu?.parentId || '',
        linkType: detectLinkType(menu?.url || ''),
        target: menu?.target === '_blank',
      });
      setHasPermissionError(false);
    }
  }, [isOpen, clientPortalId, menu]);

  const { data: menusData } = useQuery(CMS_MENU_LIST, {
    variables: { clientPortalId, limit: 100 },
    skip: !isOpen || !clientPortalId,
    fetchPolicy: 'cache-and-network',
  });

  const rawMenus: RawMenuItem[] = (menusData?.cmsMenuList || []).filter(
    (m: RawMenuItem) => m._id !== menu?._id,
  );

  const parentOptions = buildFlatTree(rawMenus).map((item) => ({
    _id: item._id,
    label: getDepthPrefix(item.depth) + item.label,
  }));

  const linkType = form.watch('linkType');
  const isCustomType = !BUILT_IN_LINK_TYPES.includes(linkType);
  const isPostType = linkType === 'post' || isCustomType;

  const { data: customTypesData } = useQuery(MENU_CUSTOM_TYPES_QUERY, {
    variables: { clientPortalId },
    skip: !isOpen || !clientPortalId,
    fetchPolicy: 'cache-first',
  });

  const { data: pagesData } = useQuery(MENU_PAGES_QUERY, {
    variables: { clientPortalId, limit: 100 },
    skip: !isOpen || !clientPortalId || linkType !== 'page',
    fetchPolicy: 'cache-first',
  });

  const { data: postsData } = useQuery(MENU_POSTS_QUERY, {
    variables: { clientPortalId, limit: 100, type: isCustomType ? linkType : undefined },
    skip: !isOpen || !clientPortalId || !isPostType,
    fetchPolicy: 'cache-first',
  });

  const { data: categoriesData } = useQuery(MENU_CATEGORIES_QUERY, {
    variables: { clientPortalId, limit: 100 },
    skip: !isOpen || !clientPortalId || linkType !== 'category',
    fetchPolicy: 'cache-first',
  });

  const { data: tagsData } = useQuery(MENU_TAGS_QUERY, {
    variables: { clientPortalId, language: selectedLanguage || cmsLanguage },
    skip: !isOpen || !clientPortalId || linkType !== 'tag',
    fetchPolicy: 'cache-first',
  });

  const { data: detectData } = useQuery(MENU_DETECT_QUERY, {
    variables: { clientPortalId, limit: 100 },
    skip: !isOpen || !isEditing || !clientPortalId,
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    if (!isEditing || !detectData || !menu?.url) return;
    const url = menu.url;
    if (url.startsWith('/category/') || url.startsWith('/tag/')) return;
    if (!url.startsWith('/')) return;

    const detectedPages: { _id: string; slug: string }[] =
      detectData.cmsPageList?.pages || [];
    const detectedPosts: { _id: string; slug: string; customPostType?: { _id: string } }[] =
      detectData.cmsPostList?.posts || [];

    const matchedPage = detectedPages.find((p) => `/${p.slug}` === url);
    if (matchedPage) {
      form.setValue('linkType', 'page');
      return;
    }

    const matchedPost = detectedPosts.find((p) => `/${p.slug}` === url);
    if (matchedPost) {
      form.setValue('linkType', matchedPost.customPostType?._id || 'post');
    }
  }, [detectData, isEditing, menu?.url]);

  const customTypes: MenuCustomType[] = customTypesData?.cmsCustomPostTypes || [];
  const pages: MenuContentItem[] = pagesData?.cmsPageList?.pages || [];
  const posts: MenuContentItem[] = postsData?.cmsPostList?.posts || [];
  const categories: MenuContentItem[] = categoriesData?.cmsCategories?.list || [];
  const tags: MenuContentItem[] = tagsData?.cmsTags?.tags || [];

  function handleError(error: ApolloError) {
    const permissionError = error.graphQLErrors?.some(
      (e: GraphQLErrorEntry) =>
        e.message === 'Permission required' ||
        e.extensions?.code === 'INTERNAL_SERVER_ERROR',
    );

    if (permissionError) {
      setHasPermissionError(true);
      toast({
        title: 'Permission Required',
        description: 'You do not have permission to manage menus. Please contact your administrator.',
        variant: 'destructive',
        duration: 8000,
      });
    } else {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save menu. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }

  const [addMenu, { loading: adding }] = useMutation(CMS_MENU_ADD, {
    onCompleted: () => {
      onClose();
      form.reset();
      onSuccess?.();
      toast({ title: 'Success', description: 'Menu created successfully', variant: 'default' });
    },
    onError: handleError,
  });

  const [editMenu, { loading: editing }] = useMutation(CMS_MENU_EDIT, {
    onCompleted: () => {
      onClose();
      onSuccess?.();
      toast({ title: 'Success', description: 'Menu updated successfully', variant: 'default' });
    },
    onError: handleError,
  });

  const saving = adding || editing;

  const onSubmit = (data: MenuFormData) => {
    const isNonDefaultLang =
      Boolean(selectedLanguage) &&
      Boolean(defaultLanguage) &&
      selectedLanguage !== defaultLanguage;
    const isCreating = !isEditing;
    const currentLabel = data.label;

    const input: MenuInput = {
      clientPortalId: data.clientPortalId,
      label: resolveMainLabel(currentLabel, isCreating, isNonDefaultLang, defaultLangData),
      url: data.url,
      kind: data.kind,
      target: data.target ? '_blank' : '',
    };

    if (data.parentId && data.parentId !== 'none') {
      input.parentId = data.parentId;
    }

    if (selectedLanguage) {
      input.language = resolveLanguage(selectedLanguage, defaultLanguage, isCreating, isNonDefaultLang);
    }

    if (defaultLanguage) {
      const translationEntries = buildMenuTranslations(
        translations, defaultLanguage, selectedLanguage, currentLabel, isCreating, isNonDefaultLang,
      );
      if (translationEntries.length > 0) {
        input.translations = translationEntries;
      }
    }

    if (isEditing) {
      editMenu({ variables: { _id: menu!._id, input } });
    } else {
      addMenu({ variables: { input } });
    }
  };

  const onLanguageChange = (lang: string) => {
    handleLanguageChange(
      lang,
      () => ({ title: form.getValues('label') || '' }),
      (data) => { form.setValue('label', data.title || ''); },
      menu ? { title: menu.label || '' } : undefined,
    );
    setCmsLanguage(lang);
  };

  const appliedInitialLangRef = useRef(false);
  useEffect(() => {
    if (!isOpen) {
      appliedInitialLangRef.current = false;
      return;
    }
    if (appliedInitialLangRef.current) return;
    if (!defaultLanguage || !cmsLanguage || cmsLanguage === defaultLanguage) return;
    if (selectedLanguage !== defaultLanguage) return;

    appliedInitialLangRef.current = true;
    onLanguageChange(cmsLanguage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultLanguage, cmsLanguage, selectedLanguage]);

  return {
    form,
    isEditing,
    hasPermissionError,
    saving,
    selectedLanguage,
    isTranslationMode,
    languageOptions,
    availableLanguages,
    onLanguageChange,
    onSubmit,
    linkType,
    isCustomType,
    isPostType,
    customTypes,
    pages,
    posts,
    categories,
    tags,
    parentOptions,
  };
}
