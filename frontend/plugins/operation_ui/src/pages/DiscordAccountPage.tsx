import { PageContainer, ScrollArea } from 'erxes-ui';
import { MyDiscordAccountCard } from '@/integrations/discord/components/MyDiscordAccountCard';
import { IntegrationsBackLink } from '@/integrations/components/IntegrationsBackLink';

export const DiscordAccountPage = () => (
  <PageContainer>
    <ScrollArea>
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div>
          <IntegrationsBackLink />
          <h1 className="text-xl font-semibold">My Discord account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Link your Discord account so Operation can mention you.
          </p>
        </div>
        <MyDiscordAccountCard />
      </div>
    </ScrollArea>
  </PageContainer>
);
