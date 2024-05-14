import React from 'react';
import { Button, ButtonProps } from '../common/button';

const PaymentType = ({
  type,
  name,
  url,
  ...rest
}: {
  type: string;
  name: string;
  url: string;
} & Omit<Omit<ButtonProps, 'type'>, 'variant'>) => {
  return (
    <Button
      className="h-auto justify-start px-2 gap-2 text-left"
      variant="outline"
      {...rest}
    >
      <img
        src={url}
        alt={''}
        height={48}
        width={48}
        className="flex-none p-1"
      />
      <div className="flex-1">
        <h5 className="font-medium capitalize">{type}</h5>
        <div className="text-neutral-500 text-xs font-normal line-clamp-1 capitalize">
          {name}
        </div>
      </div>
      <span className="h-4 w-4 border-2 rounded-full mr-2"></span>
    </Button>
  );
};

export default PaymentType;
