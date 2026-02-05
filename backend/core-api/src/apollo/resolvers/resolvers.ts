import automationsResolvers from '@/automations/graphql/resolvers/customResolver';
import broadcastResolvers from '@/broadcast/graphql/resolvers/customResolvers';
import clientPortalResolvers from '@/clientportal/graphql/resolvers/customResolvers';
import contactResolvers from '@/contacts/graphql/resolvers/customResolvers';
import documentResolvers from '@/documents/graphql/customResolvers';
import internalNoteResolvers from '@/internalNote/graphql/customResolvers';
import logResolvers from '@/logs/graphql/resolvers/customResolvers';
import notificationResolvers from '@/notifications/graphql/customResolvers';
import brandResolvers from '@/organization/brand/graphql/customResolver/brand';
import structureResolvers from '@/organization/structure/graphql/resolvers/customResolvers';
import userResolvers from '@/organization/team-member/graphql/customResolver';
import permissionResolvers from '@/permissions/graphql/resolvers/customResolver';
import productResolvers from '@/products/graphql/resolvers/customResolvers';
import propertiesResolvers from '@/properties/graphql/resolvers/customResolvers';
import segmentResolvers from '@/segments/graphql/resolvers/customResolvers';
import tagResolvers from '@/tags/graphql/customResolvers';

export const customResolvers = {
  ...clientPortalResolvers,
  ...contactResolvers,
  ...productResolvers,
  ...segmentResolvers,
  ...structureResolvers,
  ...logResolvers,
  ...automationsResolvers,
  ...userResolvers,
  ...brandResolvers,
  ...tagResolvers,
  ...notificationResolvers,
  ...documentResolvers,
  ...internalNoteResolvers,
  ...permissionResolvers,
  ...propertiesResolvers,
  ...broadcastResolvers,
};
