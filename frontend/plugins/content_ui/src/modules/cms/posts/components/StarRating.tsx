import { IconStar, IconStarHalfFilled } from '@tabler/icons-react';

interface StarRatingProps {
  value: number;
  label: string;
  className?: string;
  size?: 'sm' | 'lg';
}

type StarState = 'empty' | 'half' | 'full';

const getStarState = (value: number, star: number): StarState => {
  if (value >= star) {
    return 'full';
  }

  if (value >= star - 0.5) {
    return 'half';
  }

  return 'empty';
};

const getStarFill = (state: StarState) => {
  if (state === 'full') {
    return 'currentColor';
  }

  if (state === 'empty') {
    return 'none';
  }

  return undefined;
};

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
      const state = getStarState(value, star);
      const StarIcon = state === 'half' ? IconStarHalfFilled : IconStar;

      return (
        <StarIcon
          key={star}
          aria-hidden="true"
          data-filled={state !== 'empty'}
          data-state={state}
          fill={getStarFill(state)}
          className={size === 'lg' ? 'size-6' : 'size-4'}
        />
      );
    })}
  </div>
);
