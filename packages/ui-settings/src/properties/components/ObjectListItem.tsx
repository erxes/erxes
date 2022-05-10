import { FormControl } from '@erxes/ui/src/components/form';
import React, { useState } from 'react';

type Props = {
  keys: string[];
  object: any;
};

export default function ObjectListItem(props: Props) {
  const { object, keys } = props;

  const entries = Object.entries(object);

  return (
    <>
      {entries.map(e => {
        const key = e[0];
        const value: any = e[1] || '';

        if (!keys || !keys.includes(key)) {
          return null;
        }

        return (
          <>
            <p>{key}</p>
            <FormControl id={key} type="text" value={value} placeholder={key} />
          </>
        );
      })}
    </>
  );
}
