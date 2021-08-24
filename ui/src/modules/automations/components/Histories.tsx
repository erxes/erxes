import React from 'react';
import dayjs from 'dayjs';

export default function Histories(props: any) {
  return (
    <div>
      {props.histories.map((row, index) => (
        <div key={index}>
          {row.description} {dayjs(row.createdAt).format('lll')}
        </div>
      ))}
    </div>
  );
}
