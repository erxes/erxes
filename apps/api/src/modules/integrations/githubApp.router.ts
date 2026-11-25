import { db } from '@erxes/core-db';
import { connectFromTicket, githubSignIn } from '~/modules/integrations/githubAppConnect';
import {
  githubAppFacts,
  removeGithubApp,
  setGithubApp,
} from '~/modules/integrations/githubAppSettings';
import { scoped, unscoped } from '~/orpc';

export const githubAppRouter = {
  app: scoped.githubApp.app.handler(() => githubAppFacts(db())),
  setApp: unscoped.githubApp.setApp.handler(({ input }) => setGithubApp(input)),
  removeApp: scoped.githubApp.removeApp.handler(() => removeGithubApp(db())),
  signIn: unscoped.githubApp.signIn.handler(() => githubSignIn()),
  connect: unscoped.githubApp.connect.handler(({ input }) => connectFromTicket(input)),
};
