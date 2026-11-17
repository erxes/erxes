import { IconSearch } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';

/** In place of a list a search or filter emptied: what matched nothing, and what to try. */
export const NoMatches = ({ title, description }: { title: string; description: string }) => (
  <Empty>
    <Empty.Header>
      <Empty.Media variant="icon">
        <IconSearch />
      </Empty.Media>
      <Empty.Title>{title}</Empty.Title>
      <Empty.Description>{description}</Empty.Description>
    </Empty.Header>
  </Empty>
);
