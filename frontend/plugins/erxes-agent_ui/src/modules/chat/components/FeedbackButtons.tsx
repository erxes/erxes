import { IconThumbDown, IconThumbUp } from '@tabler/icons-react';
import { Tooltip } from 'erxes-ui';

// Ratings feed the learning loop: a vote reinforces or penalizes the distilled
// lessons injected into this turn's context.
export const FeedbackButtons = ({
  rating,
  onRate,
}: {
  rating?: number;
  onRate: (rating: 1 | -1) => void;
}) => (
  <Tooltip.Provider>
    {([1, -1] as const).map((value) => {
      const active = rating === value;
      const Icon = value === 1 ? IconThumbUp : IconThumbDown;
      return (
        <Tooltip key={value}>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => !active && onRate(value)}
              className={`size-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                active
                  ? value === 1
                    ? 'text-success'
                    : 'text-destructive'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            {value === 1 ? 'Good response' : 'Bad response'}
          </Tooltip.Content>
        </Tooltip>
      );
    })}
  </Tooltip.Provider>
);
