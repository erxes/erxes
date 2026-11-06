import { Avatar, readImage } from 'erxes-ui';
import { ITourismPanelHeading } from '@/tms/side-panel/tourismPanelTypes';

export const TourismPanelIdentity = ({ name, image }: ITourismPanelHeading) => (
  <section className="shrink-0 border-b px-4 py-4">
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="lg" className="size-11 flex-none">
        <Avatar.Image src={readImage(image)} />
        <Avatar.Fallback>{name?.charAt(0)}</Avatar.Fallback>
      </Avatar>
      <h2 className="min-w-0 flex-1 truncate text-lg font-semibold leading-6">
        {name}
      </h2>
    </div>
  </section>
);
