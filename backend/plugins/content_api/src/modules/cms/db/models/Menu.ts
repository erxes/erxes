import { Model } from 'mongoose';

import {
  CMS_DEFAULT_POST_URL_FIELD,
  CMS_POST_URL_FIELDS,
  CMSPostUrlField,
  ICMSMenu,
  ICMSMenuDocument,
  IMenuLinkedContent,
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
    linkType?: MenuLinkType,
  ) => {
    if (contentType) {
      const normalized = String(contentType).toLowerCase();
      return LINK_TYPE_BY_CONTENT_TYPE[normalized]
        ? normalized
        : CONTENT_TYPE_BY_LINK_TYPE[linkType || 'URL'];
    }

    return CONTENT_TYPE_BY_LINK_TYPE[linkType || 'URL'];
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
  }): Promise<ResolvedMenuContent | null> => {
    if (!menuItem.contentTypeId || !CONTENT_LINK_TYPES.has(menuItem.linkType)) {
      return null;
    }

    const query = {
      _id: menuItem.contentTypeId,
      clientPortalId: menuItem.clientPortalId,
    };

    switch (menuItem.linkType) {
      case 'PAGE':
        return models.Pages.findOne(query)
          .select({ _id: 1, name: 1, slug: 1 })
          .lean();
      case 'POST':
        return models.Posts.findOne(query)
          .select({ _id: 1, title: 1, slug: 1, count: 1 })
          .lean();
      case 'CATEGORY':
        return models.Categories.findOne(query)
          .select({ _id: 1, name: 1, slug: 1 })
          .lean();
      case 'TAG':
        return models.PostTags.findOne(query)
          .select({ _id: 1, name: 1, slug: 1 })
          .lean();
      default:
        return null;
    }
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
      normalizeLinkType(existingMenuItem?.linkType || existingMenuItem?.contentType),
    );
    const existingLinkType = normalizeLinkType(
      existingMenuItem?.linkType || existingMenuItem?.contentType,
    );

    if (explicitUrlProvided && mergedDoc.url) {
      return mergedDoc.url;
    }

    if (existingMenuItem?.url && existingLinkType === 'URL' && !explicitUrlProvided) {
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

    const linkType = normalizeLinkType(
      mergedDoc.linkType || mergedDoc.contentType,
      normalizeLinkType(existingDoc.linkType || existingDoc.contentType),
    );
    const contentType = normalizeContentType(mergedDoc.contentType, linkType);
    const openInNewTab = normalizeOpenInNewTab(
      mergedDoc,
      normalizeOpenInNewTab(existingDoc, false),
    );

    const normalizedDoc: Partial<ICMSMenu> = {
      ...doc,
      clientPortalId: mergedDoc.clientPortalId,
      linkType,
      contentType,
      openInNewTab,
      target: toLegacyTarget(openInNewTab),
    };

    if (CONTENT_LINK_TYPES.has(linkType)) {
      if (!mergedDoc.contentTypeId) {
        throw new Error('contentTypeId is required for content links');
      }

      const content = await resolveLinkedContent({
        clientPortalId: mergedDoc.clientPortalId,
        linkType,
        contentTypeId: mergedDoc.contentTypeId,
      });

      if (!content) {
        throw new Error(`Linked ${contentType} not found`);
      }

      normalizedDoc.contentTypeId = mergedDoc.contentTypeId;
      normalizedDoc.url = await buildComputedUrl(
        {
          clientPortalId: mergedDoc.clientPortalId,
          linkType,
          url: mergedDoc.url,
        },
        content,
      );
    } else {
      normalizedDoc.contentTypeId = undefined;
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
      const pages = await models.MenuItems.find(query).sort({ order: 1 }).lean();

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

      const updateDoc: any = { $set: normalizedDoc };

      if (normalizedDoc.linkType === 'URL') {
        updateDoc.$unset = { contentTypeId: 1 };
      }

      const menu = await models.MenuItems.findOneAndUpdate(
        { _id },
        updateDoc,
        { new: true },
      );
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
      const contentType = normalizeContentType(rawMenuItem.contentType, linkType);
      const openInNewTab = normalizeOpenInNewTab(rawMenuItem, false);
      const content = await resolveLinkedContent({
        clientPortalId: rawMenuItem.clientPortalId,
        linkType,
        contentTypeId: rawMenuItem.contentTypeId,
      });

      return {
        ...rawMenuItem,
        linkType,
        contentType,
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
        linkedContent: content ? buildLinkedContentSummary(linkType, content) : null,
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
