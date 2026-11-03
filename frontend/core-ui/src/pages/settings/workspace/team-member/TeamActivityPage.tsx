import { ScrollArea } from 'erxes-ui';
import { TeamActivityOverview } from '@/settings/team-member/activity/components/TeamActivityOverview';

export function TeamActivityPage() {
  return (
    <ScrollArea className="h-full w-full">
      <TeamActivityOverview />
      <ScrollArea.Bar />
    </ScrollArea>
  );
}
