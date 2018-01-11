import React from 'react';
import { Route } from 'react-router-dom';
import ChannelsRoutes from './channels/routes';
import BrandsRoutes from './brands/routes';
import ResponseTemplatesRoutes from './responseTemplates/routes';
import EmailTemplatesRoutes from './emailTemplates/routes';
import TeamMembersRoutes from './team/routes';
import EmailRoutes from './email/routes';
import FormsRoutes from './forms/routes';
import IntegrationsRoutes from './integrations/routes';
import KnowledgeBaseRoutes from './knowledgeBase/routes';
import ProfileRoutes from './profile/routes';
import Main from './main/routes';
import Sidebar from './Sidebar';
import { Contents } from 'modules/layout/styles';

const routes = () => {
  return (
    <Contents>
      <Sidebar />
      <ChannelsRoutes key="ChannelsRoutes" />
      <BrandsRoutes key="BrandsRoutes" />
      <ResponseTemplatesRoutes key="ResponseTemplatesRoutes" />
      <EmailTemplatesRoutes key="EmailTemplatesRoutes" />
      <TeamMembersRoutes key="TeamMembersRoutes" />
      <EmailRoutes key="EmailRoutes" />
      <FormsRoutes key="FormsRoutes" />
      <IntegrationsRoutes key="IntegrationsRoutes" />
      <KnowledgeBaseRoutes key="KnowledgeBaseRoutes" />
      <ProfileRoutes key="ProfileRoutes" />
    </Contents>
  );
};

const main = () => {
  return (
    <Contents>
      <Sidebar />
      <Main />
    </Contents>
  );
};

const settingsRoute = () => <Route path="/settings" component={main} />;

export default settingsRoute;
