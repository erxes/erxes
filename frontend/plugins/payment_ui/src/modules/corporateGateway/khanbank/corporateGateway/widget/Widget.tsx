import { Button } from 'erxes-ui';
import { Popover } from 'erxes-ui/components/popover';
import { DollarSign } from 'lucide-react';

import RateList from '../containers/Rates';

const Widget = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <DollarSign size={18} />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-4">
        <RateList />
      </PopoverContent>
    </Popover>
  );
};

export default Widget;
