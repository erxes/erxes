import { Model } from 'mongoose';

import {
  CMS_DEFAULT_POST_URL_FIELD,
  CMS_POST_URL_FIELDS,
  CMSPostUrlField,
  ICMSMenu,
  ICMSMenuDocument,
  IMenuLinkedContent,
  MenuContentSource,
  MenuLinkType,
} from '@/cms/@types/cms';
import { IModels } from '~/connectionResolvers';
import { cmsMenuSchema } from '@/cms/db/definitions/cms';
import slugify from 'slugify';
import { generateUniqueSlug } from '@/cms/utils/common';

const LINK_TYPE_BY_CONTENT_TYPE: Record<string, MenuLinkType> = {
  url: 'URL',
  page: 'PAGE',
  post: 'POST',
  category: 'CATEGORY',
  tag: 'TAG',
};

const CONTENT_TYPE_BY_LINK_TYPE: Record<MenuLinkType, string> = {
  URL: 'url',
  PAGE: 'page',
  POST: 'post',
  CATEGORY: 'category',
  TAG: 'tag',
};

const CONTENT_LINK_TYPES = new Set<MenuLinkType>([
  'PAGE',
  'POST',
  'CATEGORY',
  'TAG',
]);

type ResolvedMenuContent = {
  _id: string;
  title?: string;
  name?: string;
  slug?: string;
  count?: number;
};

export interface ICMSMenuItemModel extends Model<ICMSMenuDocument> {
  getMenuItems: (query: any) => Promise<ICMSMenuDocument[]>;
  createMenuItem: (doc: ICMSMenu) => Promise<ICMSMenuDocument>;
  updateMenuItem: (_id: string, doc: ICMSMenu) => Promise<ICMSMenuDocument>;
  deleteMenuItem: (_id: string) => any;
  hydrateMenuItem: (menuItem: any) => Promise<any>;
  hydrateMenuItems: (menuItems: any[]) => Promise<any[]>;
}

export const loadMenuItemClass = (models: IModels) => {
  const hasOwn = (value: object, key: string) =>
    Object.prototype.hasOwnProperty.call(value, key);

  const normalizeLinkType = (
    value?: string | null,
    fallback?: MenuLinkType,
  ): MenuLinkType => {
    if (!value) {
      return fallback || 'URL';
    }

    const upperValue = String(value).toUpperCase();
    if (upperValue in CONTENT_TYPE_BY_LINK_TYPE) {
      return upperValue as MenuLinkType;
    }

    const mappedValue = LINK_TYPE_BY_CONTENT_TYPE[String(value).toLowerCase()];
    return mappedValue || fallback || 'URL';
  };

  const normalizeContentType = (
    contentType?: string | null,
    _linkType?: MenuLinkType,
  ) => {
    if (contentType) {
      const normalized = String(contentType).toLowerCase();
      if (LINK_TYPE_BY_CONTENT_TYPE[normalized]) return normalized;
      return normalized;
    }

    return undefined;
  };

  const normalizeContentSource = (
    value?: string | null,
    fallback: MenuContentSource = 'cms',
  ): MenuContentSource => {
    return String(value || fallback).toLowerCase() === 'web' ? 'web' : 'cms';
  };

  const normalizeOpenInNewTab = (
    doc: Partial<ICMSMenu>,
    fallback = false,
  ): boolean => {
    if (typeof doc.openInNewTab === 'boolean') {
      return doc.openInNewTab;
    }

    if (typeof doc.target === 'string') {
      return doc.target === '_blank';
    }

    return fallback;
  };

  const toLegacyTarget = (openInNewTab: boolean) =>
    openInNewTab ? '_blank' : '';

  const getPostUrlField = async (
    clientPortalId: string,
  ): Promise<CMSPostUrlField> => {
    const cms = await models.CMS.findOne({ clientPortalId })
      .select({ postUrlField: 1 })
      .lean();

    if (
      cms?.postUrlField &&
      CMS_POST_URL_FIELDS.includes(cms.postUrlField as CMSPostUrlField)
    ) {
      return cms.postUrlField as CMSPostUrlField;
    }

    return CMS_DEFAULT_POST_URL_FIELD;
  };

  const resolveLinkedContent = async (menuItem: {
    clientPortalId: string;
    linkType: MenuLinkType;
    contentTypeId?: string;
    type?: MenuContentSource | string;
  }): Promise<ResolvedMenuContent | null> => {
    if (!menuItem.contentTypeId || !CONTENT_LINK_TYPES.has(menuItem.linkType)) {
      return null;
    }

    const contentTypeId = String(menuItem.contentTypeId).trim();
    const slug = normalizeContentLookupValue(menuItem.linkType, contentTypeId);
    const contentQuery: any = {
      clientPortalId: menuItem.clientPortalId,
      $or: [{ _id: contentTypeId }],
    };

    if (slug && slug !== contentTypeId) {
      contentQuery.$or.push({ _id: slug });
    }

    if (slug) {
      contentQuery.$or.push({ slug });
    }

    switch (menuItem.linkType) {
      case 'PAGE': {
        const pageModel: any =
          normalizeContentSource(menuItem.type) === 'web'
            ? models.WebPages
            : models.Pages;

        return pageModel
          .findOne(contentQuery)
          .select({ _id: 1, name: 1, slug: 1 })
          .lean();
      }
      case 'POST':
        return models.Posts.findOne(contentQuery)
          .select({ _id: 1, title: 1, slug: 1, count: 1 })
          .lean();
      case 'CATEGORY':
        return models.Categories.findOne(contentQuery)
          .select({ _id: 1, name: 1, slug: 1 })
          .lean();
      case 'TAG':
        return models.PostTags.findOne(contentQuery)
          .select({ _id: 1, name: 1, slug: 1 })
          .lean();
      default:
        return null;
    }
  };

  const normalizeContentLookupValue = (
    linkType: MenuLinkType,
    value: string,
  ) => {
    const trimmedValue = value.trim().replace(/^\/+|\/+$/g, '');

    if (linkType === 'CATEGORY') {
      return trimmedValue.replace(/^category\//, '');
    }

    if (linkType === 'TAG') {
      return trimmedValue.replace(/^tag\//, '');
    }

    return trimmedValue;
  };

  const getLinkedContentLabel = (
    linkType: MenuLinkType,
    type?: MenuContentSource,
  ) => {
    if (linkType === 'PAGE' && type === 'web') {
      return 'web page';
    }

    return CONTENT_TYPE_BY_LINK_TYPE[linkType];
  };

  const buildLinkedContentSummary = (
    linkType: MenuLinkType,
    content: ResolvedMenuContent,
  ): IMenuLinkedContent => ({
    _id: String(content._id),
    title: content.title || content.name,
    slug: content.slug,
    linkType,
  });

  const buildComputedUrl = async (
    menuItem: {
      clientPortalId: string;
      linkType: MenuLinkType;
      url?: string;
    },
    content: ResolvedMenuContent | null,
  ) => {
    if (menuItem.linkType === 'URL') {
      return menuItem.url;
    }

    if (!content) {
      return undefined;
    }

    switch (menuItem.linkType) {
      case 'PAGE':
        return content.slug ? `/${content.slug}` : undefined;
      case 'POST': {
        const postUrlField = await getPostUrlField(menuItem.clientPortalId);
        const identifier = content[postUrlField];

        if (identifier === undefined || identifier === null) {
          return undefined;
        }

        return `/${String(identifier)}`;
      }
      case 'CATEGORY':
        return content.slug ? `/category/${content.slug}` : undefined;
      case 'TAG':
        return content.slug ? `/tag/${content.slug}` : undefined;
      default:
        return undefined;
    }
  };

  const prepareDirectUrl = async (
    doc: Partial<ICMSMenu>,
    mergedDoc: Partial<ICMSMenu>,
    existingMenuItem?: ICMSMenuDocument | null,
  ) => {
    const explicitUrlProvided = hasOwn(doc, 'url');
    const linkType = normalizeLinkType(
      mergedDoc.linkType || mergedDoc.contentType,
      normalizeLinkType(
        existingMenuItem?.linkType || existingMenuItem?.contentType,
      ),
    );
    const existingLinkType = normalizeLinkType(
      existingMenuItem?.linkType || existingMenuItem?.contentType,
    );

    if (explicitUrlProvided && mergedDoc.url) {
      return mergedDoc.url;
    }

    if (
      existingMenuItem?.url &&
      existingLinkType === 'URL' &&
      !explicitUrlProvided
    ) {
      return existingMenuItem.url;
    }

    if (linkType !== 'URL') {
      return undefined;
    }

    if (!mergedDoc.label) {
      return mergedDoc.url;
    }

    const baseSlug = slugify(mergedDoc.label, { lower: true });
    return generateUniqueSlug(
      models.MenuItems,
      mergedDoc.clientPortalId as string,
      'url',
      baseSlug,
    );
  };

  const normalizeMenuInput = async (
    doc: Partial<ICMSMenu>,
    existingMenuItem?: ICMSMenuDocument | null,
  ) => {
    const existingDoc = (existingMenuItem as any)?.toObject
      ? (existingMenuItem as any).toObject()
      : existingMenuItem || {};
    const mergedDoc = { ...existingDoc, ...doc } as Partial<ICMSMenu>;

    if (!mergedDoc.clientPortalId) {
      throw new Error('clientPortalId is required');
    }
    const newTypeSource = (doc as any).linkType || (doc as any).contentType;
    const existingTypeSource = existingDoc.linkType || existingDoc.contentType;
    const linkType = normalizeLinkType(
      newTypeSource || mergedDoc.linkType || mergedDoc.contentType,
      normalizeLinkType(existingTypeSource),
    );
    const contentType = normalizeContentType(mergedDoc.contentType, linkType);
    const contentSource =
      linkType === 'PAGE'
        ? normalizeContentSource(
            mergedDoc.type,
            normalizeContentSource(existingDoc.type),
          )
        : undefined;
    const openInNewTab = normalizeOpenInNewTab(
      mergedDoc,
      normalizeOpenInNewTab(existingDoc, false),
    );

    const normalizedDoc: Partial<ICMSMenu> = {
      ...doc,
      clientPortalId: mergedDoc.clientPortalId,
      linkType,
      openInNewTab,
      target: toLegacyTarget(openInNewTab),
    };

    if (contentType) {
      normalizedDoc.contentType = contentType;
    } else {
      normalizedDoc.contentType = undefined;
    }

    normalizedDoc.type = contentSource;

    if (CONTENT_LINK_TYPES.has(linkType) && mergedDoc.contentTypeId) {
      const content = await resolveLinkedContent({
        clientPortalId: mergedDoc.clientPortalId,
        linkType,
        contentTypeId: mergedDoc.contentTypeId,
        type: contentSource,
      });

      if (!content) {
        throw new Error(
          'Linked ' +
            getLinkedContentLabel(linkType, contentSource) +
            ' not found',
        );
      }

      normalizedDoc.contentTypeId = String(content._id);
      normalizedDoc.url = await buildComputedUrl(
        {
          clientPortalId: mergedDoc.clientPortalId,
          linkType,
          url: mergedDoc.url,
        },
        content,
      );
    } else {
      normalizedDoc.contentTypeId = mergedDoc.contentTypeId || undefined;
      normalizedDoc.url = await prepareDirectUrl(
        doc,
        mergedDoc,
        existingMenuItem,
      );
    }

    return normalizedDoc;
  };

  class MenuItems {
    public static getMenuItems = async (query: any) => {
      const pages = await models.MenuItems.find(query)
        .sort({ order: 1 })
        .lean();

      return pages;
    };

    public static createMenuItem = async (doc: ICMSMenu) => {
      const normalizedDoc = await normalizeMenuInput(doc);

      if (!normalizedDoc.order) {
        // find max order
        const lastMenuItem = await models.MenuItems.findOne({
          clientPortalId: normalizedDoc.clientPortalId,
        })
          .sort({ order: -1 })
          .lean();

        if (lastMenuItem) {
          normalizedDoc.order = (lastMenuItem.order || 0) + 1;
        } else {
          normalizedDoc.order = 1;
        }
      }

      return models.MenuItems.create(normalizedDoc);
    };

    public static updateMenuItem = async (_id: string, doc: ICMSMenu) => {
      const existingMenuItem = await models.MenuItems.findOne({ _id });

      if (!existingMenuItem) {
        throw new Error('Menu item not found');
      }

      const normalizedDoc = await normalizeMenuInput(doc, existingMenuItem);

      const updateDoc: any = {
        $set: Object.fromEntries(
          Object.entries(normalizedDoc).filter(
            ([, value]) => value !== undefined,
          ),
        ),
      };

      if (
        normalizedDoc.contentType === undefined ||
        normalizedDoc.contentTypeId === undefined ||
        normalizedDoc.type === undefined
      ) {
        updateDoc.$unset = {};

        if (normalizedDoc.contentType === undefined) {
          updateDoc.$unset.contentType = 1;
        }

        if (normalizedDoc.contentTypeId === undefined) {
          updateDoc.$unset.contentTypeId = 1;
        }

        if (normalizedDoc.type === undefined) {
          updateDoc.$unset.type = 1;
        }
      }

      const menu = await models.MenuItems.findOneAndUpdate({ _id }, updateDoc, {
        new: true,
      });
      return menu;
    };

    public static deleteMenuItem = async (_id: string) => {
      const page = await models.MenuItems.findOneAndDelete({ _id: _id });
      return page;
    };

    public static hydrateMenuItem = async (menuItem: any) => {
      if (!menuItem) {
        return null;
      }

      const rawMenuItem = menuItem.toObject ? menuItem.toObject() : menuItem;
      const linkType = normalizeLinkType(
        rawMenuItem.linkType || rawMenuItem.contentType,
      );
      const openInNewTab = normalizeOpenInNewTab(rawMenuItem, false);
      const content = await resolveLinkedContent({
        clientPortalId: rawMenuItem.clientPortalId,
        linkType,
        contentTypeId: rawMenuItem.contentTypeId,
        type: rawMenuItem.type,
      });

      return {
        ...rawMenuItem,
        linkType,
        openInNewTab,
        target: toLegacyTarget(openInNewTab),
        url: await buildComputedUrl(
          {
            clientPortalId: rawMenuItem.clientPortalId,
            linkType,
            url: rawMenuItem.url,
          },
          content,
        ),
        linkedContent: content
          ? buildLinkedContentSummary(linkType, content)
          : null,
      };
    };

    public static hydrateMenuItems = async (menuItems: any[]) => {
      return Promise.all(
        (menuItems || []).map((menuItem) => this.hydrateMenuItem(menuItem)),
      );
    };
  }
  cmsMenuSchema.loadClass(MenuItems);

  return cmsMenuSchema;
};
