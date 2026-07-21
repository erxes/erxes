import { IconStar, IconStarHalfFilled } from '@tabler/icons-react';

interface StarRatingProps {
  value: number;
  label: string;
  className?: string;
  size?: 'sm' | 'lg';
}

export const StarRating = ({
  value,
  label,
  className,
  size = 'sm',
}: StarRatingProps) => (
  <div
    role="img"
    aria-label={label}
    className={`flex items-center gap-0.5 text-warning ${className ?? ''}`}
  >
    {[1, 2, 3, 4, 5].map((star) => {
      const state =
        value >= star ? 'full' : value >= star - 0.5 ? 'half' : 'empty';
      const StarIcon = state === 'half' ? IconStarHalfFilled : IconStar;

      return (
        <StarIcon
          key={star}
          aria-hidden="true"
          data-filled={state !== 'empty'}
          data-state={state}
          fill={
            state === 'full'
              ? 'currentColor'
              : state === 'empty'
              ? 'none'
              : undefined
          }
          className={size === 'lg' ? 'size-6' : 'size-4'}
        />
      );
    })}
  </div>
);
