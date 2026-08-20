import { Marker } from './bot-marker';

export function BotSeparator({ content }: { content: string }) {
  return (
    <Marker variant={'separator'}>
      <Marker.Content className="text-xs text-accent-foreground font-medium">
        {content}
      </Marker.Content>
    </Marker>
  );
}
