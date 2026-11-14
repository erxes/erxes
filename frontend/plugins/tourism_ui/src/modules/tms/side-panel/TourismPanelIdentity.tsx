import { Avatar, readImage } from 'erxes-ui';
import { ITourismPanelHeading } from '@/tms/side-panel/tourismPanelTypes';

export const TourismPanelIdentity = ({ name, image }: ITourismPanelHeading) => (
  <div className="flex min-w-0 flex-1 items-center gap-2">
    <Avatar size="lg" className="size-7 flex-none">
      <Avatar.Image src={readImage(image)} />
      <Avatar.Fallback>{name?.charAt(0)}</Avatar.Fallback>
    </Avatar>
    <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
  </div>
);
