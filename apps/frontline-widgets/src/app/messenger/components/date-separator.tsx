import { Marker } from './bot-marker';

export function DateSeparator({ date }: { date: string }) {
  return (
    <Marker variant={'separator'}>
      <Marker.Content className="text-xs text-accent-foreground font-medium">
        {date}
      </Marker.Content>
    </Marker>
  );
}
