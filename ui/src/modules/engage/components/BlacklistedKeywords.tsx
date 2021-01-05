import React from 'react';
import { SMS_BLACK_KEYWORDS } from '../constants';
import { BlackWord, Recipients } from '../styles';

type Props = {
  content: string;
}

export default function BlacklistedKeywords({ content }: Props) {
  return (
    <>
      <p>The following list of words & URLs are restricted.</p>
      <Recipients>
        {SMS_BLACK_KEYWORDS.map(word => <BlackWord key={word} written={content.indexOf(word) !== -1}>{word} </BlackWord>)}
      </Recipients>
    </>
  );
}