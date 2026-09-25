import { PersonalChannelDetails } from '@/channels/components/settings/personal-channel/PersonalChannelDetails';
import { ScrollArea } from 'erxes-ui';

export const PersonalChannelPage = () => {
  return (
    <ScrollArea className="flex-1">
      <div className="h-full flex flex-col">
        <section className="mx-auto max-w-4xl w-full relative h-full flex-1 py-8">
          <PersonalChannelDetails />
        </section>
      </div>
    </ScrollArea>
  );
};
