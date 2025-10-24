import { cn } from 'erxes-ui';
import React from 'react';
import { Link } from 'react-router-dom';
import { useIntegrationsCounts } from '../hooks/useIntegrationsCounts';

type Props = {
  img: string;
  label: string;
  description: string;
  to: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Integration = React.forwardRef<HTMLButtonElement, Props>(
  ({ label, description, to, img, ...rest }, ref) => {
    const { totalCount, loading } = useIntegrationsCounts({
      variables: {
        kind: to,
      },
      skip: !to,
    });
    return (
      <Link to={{ pathname: `/settings/frontline/inbox/details/${to}` }}>
        <button
          ref={ref}
          {...rest}
          className={cn(
            'relative flex flex-col items-start gap-2 p-3 shadow-xs rounded-lg border hover:bg-muted transition ease-linear duration-100 hover:scale-105 hover:shadow-sm h-full w-full',
            rest.className,
          )}
        >
          <span
            className={cn(
              totalCount && totalCount > 0
                ? 'text-primary'
                : 'text-muted-foreground',
              'absolute top-2 right-2 text-xs font-medium font-mono',
            )}
          >
            ({totalCount})
          </span>
          <div className="flex gap-2 items-center">
            <span className="flex items-center justify-center w-5 h-5 p-0.5 rounded-sm shadow-sm relative">
              <img
                alt={to}
                src={img}
                className="w-full h-full object-contain"
              />
            </span>
            <strong className="whitespace-break-spaces w-4/5 text-sm text-left line-clamp-2">
              {label}
            </strong>
          </div>

          <span className="text-sm text-muted-foreground text-left font-normal line-clamp-3 overflow-hidden leading-[140%]">
            {description}
          </span>
        </button>
      </Link>
    );
  },
);
