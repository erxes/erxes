import { FormControl } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import React from 'react';

type Props = {
  placeholder?: string;
  onChange: (e: React.FormEvent<HTMLElement>) => void;
};

function Filter({ placeholder = 'Search', onChange }: Props) {
  return (
    <FormControl
      type="text"
      placeholder={__(placeholder)}
      onChange={onChange}
      autoFocus={true}
    />
  );
}

export default Filter;
