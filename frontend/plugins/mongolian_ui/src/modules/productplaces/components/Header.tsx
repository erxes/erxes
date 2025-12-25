import React from 'react';
import { Separator } from 'erxes-ui/components/separator';

const Header = () => {
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src="/images/actions/25.svg"
          alt="Product Places"
          className="h-6 w-6"
        />

        <div>
          <h1 className="text-base font-semibold">
            Product Places config
          </h1>
        </div>
      </div>

      <Separator />
    </>
  );
};

export default Header;
