import { connectFromTicket, githubSignIn } from '~/modules/integrations/githubAppConnect';
import { unscoped } from '~/orpc';

export const githubAppRouter = {
  signIn: unscoped.githubApp.signIn.handler(() => githubSignIn()),
  connect: unscoped.githubApp.connect.handler(({ input }) => connectFromTicket(input)),
};
