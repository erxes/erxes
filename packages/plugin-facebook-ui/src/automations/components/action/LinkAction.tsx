import colors from '@erxes/ui/src/styles/colors';
import Icon from '@erxes/ui/src/components/Icon';
import FormControl from '@erxes/ui/src/components/form/Control';
import React, { useRef } from 'react';
import Popover from '@erxes/ui/src/components/Popover';
import { PopoverContent } from '@erxes/ui/src/components/filterableList/styles';
import { Padding } from '../../styles';
type Props = {
  onChange: (e) => void;
  link?: string;
  name?: string;
  container: any;
};

function LinkAction({ onChange, link, name, container }: Props) {
  return (
    <Popover
      placement='top-start'
      trigger={<Icon icon='link' color={link ? colors.colorCoreBlue : ''} />}
    >
      <PopoverContent>
        <Padding>
          <FormControl
            name={name}
            onChange={onChange}
            value={link || ''}
            placeholder='Type or paste link'
          />
        </Padding>
      </PopoverContent>
    </Popover>
  );
}

export default LinkAction;
