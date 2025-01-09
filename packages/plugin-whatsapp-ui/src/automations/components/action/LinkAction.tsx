import Icon from '@erxes/ui/src/components/Icon';
import Popover from '@erxes/ui/src/components/Popover';
import { PopoverContent } from '@erxes/ui/src/components/filterableList/styles';
import { Input } from '@erxes/ui/src/components/form/styles';
import colors from '@erxes/ui/src/styles/colors';
import React, { useRef } from 'react';
import { Padding } from '../../styles';
type Props = {
  onChange: (e) => void;
  link?: string;
  name?: string;
  container: any;
};

function LinkAction({ onChange, link, name, container }: Props) {
  let overlayTrigger = useRef(null);
  return (
    <Popover
      innerRef={overlayTrigger}
      placement="top-start"
      trigger={<Icon icon="link" color={link ? colors.colorCoreBlue : ''} />}
    >
      <PopoverContent style={{ width: '250px' }}>
        <Padding>
          <Input
            name={name}
            onChange={onChange}
            value={link || ''}
            placeholder="Type or paste link"
          />
        </Padding>
      </PopoverContent>
    </Popover>
  );
}

export default LinkAction;
