import { BroadcastBrandChooser } from './BroadcastBrandChooser';
import { BroadcastTagChooser } from './BroadcastTagChooser';

const BROADCAST_CHOOSER = {
  brand: BroadcastBrandChooser,
  tag: BroadcastTagChooser,
};

export const BroadcastChooser = ({ contentType }: { contentType: string }) => {
  return <div>BroadcastChooser</div>;
};
