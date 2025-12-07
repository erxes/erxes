import { checkPermission, requireLogin, moduleRequireLogin } from 'erxes-api-shared/core-modules';

export interface PermissionConfig {
  permission: string;
  requireLoginFields?: string[];
}

export class PermissionManager {
  /**
   * Apply permissions to a set of mutations
   */
  static applyMutationPermissions(
    mutations: any,
    config: PermissionConfig
  ): void {
    const { permission, requireLoginFields = [] } = config;

    // Apply requireLogin to specified fields
    requireLoginFields.forEach(field => {
      if (mutations[field]) {
        requireLogin(mutations, field);
      }
    });

    // Apply permission checks to all mutation fields
    Object.keys(mutations).forEach(field => {
      checkPermission(mutations, field, permission, []);
    });
  }

  /**
   * Apply permissions to a set of queries
   */
  static applyQueryPermissions(
    queries: any,
    config: PermissionConfig
  ): void {
    const { permission, requireLoginFields = [] } = config;

    // Apply module require login
    moduleRequireLogin(queries);

    // Apply requireLogin to specified fields
    requireLoginFields.forEach(field => {
      if (queries[field]) {
        requireLogin(queries, field);
      }
    });

    // Apply permission checks to specified fields
    requireLoginFields.forEach(field => {
      if (queries[field]) {
        checkPermission(queries, field, permission, []);
      }
    });
  }

  /**
   * Apply knowledge base specific permissions
   */
  static applyKnowledgeBasePermissions(mutations: any): void {
    const knowledgeBaseFields = [
      'knowledgeBaseTopicsAdd',
      'knowledgeBaseTopicsEdit',
      'knowledgeBaseTopicsRemove',
      'knowledgeBaseCategoriesAdd',
      'knowledgeBaseCategoriesEdit',
      'knowledgeBaseCategoriesRemove',
      'knowledgeBaseArticlesAdd',
      'knowledgeBaseArticlesEdit',
      'knowledgeBaseArticlesRemove',
    ];

    knowledgeBaseFields.forEach(field => {
      if (mutations[field]) {
        checkPermission(mutations, field, 'manageKnowledgeBase');
      }
    });
  }

  /**
   * Apply knowledge base query permissions
   */
  static applyKnowledgeBaseQueryPermissions(queries: any): void {
    moduleRequireLogin(queries);

    const knowledgeBaseQueryFields = [
      'knowledgeBaseArticles',
      'knowledgeBaseTopics',
      'knowledgeBaseCategories',
    ];

    knowledgeBaseQueryFields.forEach(field => {
      if (queries[field]) {
        checkPermission(queries, field, 'showKnowledgeBase', []);
      }
    });
  }

  /**
   * Apply CMS specific permissions
   */
  static applyCmsPermissions(mutations: any): void {
    const cmsFields = [
      'cmsPostsAdd',
      'cmsPostsEdit',
      'cmsPostsRemove',
      'cmsPostsChangeStatus',
      'cmsPostsToggleFeatured',
      'cmsCategoriesAdd',
      'cmsCategoriesEdit',
      'cmsCategoriesRemove',
      'cmsCategoriesToggleStatus',
      'cmsPagesAdd',
      'cmsPagesEdit',
      'cmsPagesRemove',
    ];

    cmsFields.forEach(field => {
      if (mutations[field]) {
        requireLogin(mutations, field);
        checkPermission(mutations, field, 'manageCms', []);
      }
    });
  }
}

/**
 * Predefined permission configurations
 */
export const PERMISSION_CONFIGS = {
  CMS: {
    permission: 'manageCms',
    requireLoginFields: [
      'cmsPostsAdd',
      'cmsPostsEdit',
      'cmsPostsRemove',
      'cmsPostsChangeStatus',
      'cmsPostsToggleFeatured',
      'cmsCategoriesAdd',
      'cmsCategoriesEdit',
      'cmsCategoriesRemove',
      'cmsCategoriesToggleStatus',
      'cmsPagesAdd',
      'cmsPagesEdit',
      'cmsPagesRemove',
    ],
  },
  KNOWLEDGE_BASE: {
    permission: 'manageKnowledgeBase',
    requireLoginFields: [
      'knowledgeBaseTopicsAdd',
      'knowledgeBaseTopicsEdit',
      'knowledgeBaseTopicsRemove',
      'knowledgeBaseCategoriesAdd',
      'knowledgeBaseCategoriesEdit',
      'knowledgeBaseCategoriesRemove',
      'knowledgeBaseArticlesAdd',
      'knowledgeBaseArticlesEdit',
      'knowledgeBaseArticlesRemove',
    ],
  },
  KNOWLEDGE_BASE_QUERIES: {
    permission: 'showKnowledgeBase',
    requireLoginFields: [
      'knowledgeBaseArticles',
      'knowledgeBaseTopics',
      'knowledgeBaseCategories',
    ],
  },
} as const;
