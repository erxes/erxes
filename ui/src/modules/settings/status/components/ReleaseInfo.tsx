import React from 'react';

type Props = {
  info;
};

const parseMarkdown = markdownText => {
  const htmlText = markdownText
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*)\*/gim, '<i>$1</i>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/\n$/gim, '<br />');

  return htmlText.trim();
};

const ReleaseInfo = (props: Props) => {
  const releaseInfo = props.info.releaseInfo || {};

  console.log('fsdfsdfsf', releaseInfo.body || '');

  console.log('mmmm', parseMarkdown(releaseInfo.body || ''));

  return <div>info</div>;
};

export default ReleaseInfo;
