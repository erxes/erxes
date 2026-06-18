import inboxResolvers from '@/inbox/graphql/resolvers/customResolvers';
import integrationFacebookResolvers from '@/integrations/facebook/graphql/resolvers/customResolvers';
import { Channel } from '@/channel/graphql/resolvers/customResolvers/channel';
import { ChannelMember } from '@/channel/graphql/resolvers/customResolvers/member';
import { Pipeline } from '@/ticket/graphql/resolvers/customResolvers/pipeline';
import { Ticket } from '@/ticket/graphql/resolvers/customResolvers/status';
import {
  Form,
  Submission,
} from '@/form/graphql/resolvers/customResolvers/forms';
import KnowledgeBaseArticle from '@/knowledgebase/graphql/resolvers/customResolvers/article';
import {
  KnowledgeBaseCategory,
  KnowledgeBaseParentCategory,
} from '@/knowledgebase/graphql/resolvers/customResolvers/category';
import KnowledgeBaseTopic from '@/knowledgebase/graphql/resolvers/customResolvers/topic';
export const customResolvers = {
  ...inboxResolvers,
  ...integrationFacebookResolvers,
  Channel,
  ChannelMember,
  Pipeline,
  Ticket,
  Form,
  Submission,
  KnowledgeBaseArticle,
  KnowledgeBaseCategory,
  KnowledgeBaseParentCategory,
  KnowledgeBaseTopic,
};
