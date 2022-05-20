import React from 'react';

type Props = {
  text: string;
  data: any;
  type?: string;
};

export default function LocaleField({ text, data, type }: Props) {
  if (text && data) {
    if (type === 'bold') {
      return (
        <p>
          <b>{text}:</b>
          <strong>
            {' '}
            <span className="totalCount">
              {data.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              ₮
            </span>
          </strong>
        </p>
      );
    }

    if (type === 'big') {
      return (
        <p>
          <b className="big">{text}:</b>
          <span>
            {data.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
            ₮
          </span>
        </p>
      );
    }

    return (
      <p>
        <b>{text}:</b>
        <span>
          {data.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
          ₮
        </span>
      </p>
    );
  }
  return null;
}
