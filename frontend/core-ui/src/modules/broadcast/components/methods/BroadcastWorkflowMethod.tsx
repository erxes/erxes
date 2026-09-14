import {
  IconAffiliate,
  IconArrowsSplit2,
  IconUsers,
} from '@tabler/icons-react';
import { Card } from 'erxes-ui';

const STEPS = [
  {
    icon: IconUsers,
    title: 'The audience is the loop',
    description:
      'The flow runs once for every customer in the segment or tag you picked, one run each.',
  },
  {
    icon: IconArrowsSplit2,
    title: 'Draw it on the right',
    description:
      'Add actions from the canvas beside this panel. The Start node stands for the customer each run receives.',
  },
  {
    icon: IconAffiliate,
    title: 'Live once the flow exists',
    description:
      'A campaign with an empty flow cannot go live, so add at least one action before setting it live.',
  },
];

/**
 * A workflow campaign has nothing to fill in here: its content is the flow,
 * and the flow is drawn in the automation builder once the campaign exists.
 */
export const BroadcastWorkflowMethod = () => (
  <div className="flex h-full flex-col gap-3">
    {STEPS.map(({ icon: Icon, title, description }) => (
      <Card key={title} className="flex gap-3 border p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </Card>
    ))}
  </div>
);
