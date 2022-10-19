import React, { useState } from 'react';
import styles from '../../../src/components/styles.module.css';
import CodeBlock from '@theme/CodeBlock';
import 'erxes-icon/css/erxes.min.css';
import { rgb, rgba, darken, lighten } from 'erxes-ui/lib/styles/ecolor';
import Alert from 'erxes-ui/lib/utils/Alert/index';

export function ColorComponent(props) {
  const [copySuccess, setCopySuccess] = useState('');
  const { type, colors = [] } = props;

  const copyToClipBoard = async copyMe => {
    try {
      await navigator.clipboard.writeText(copyMe);
      setCopySuccess(`Copied! (${copyMe})`);
      Alert.success(`Copied! (${copyMe})`);
    } catch (err) {
      setCopySuccess('Failed to copy!');
    }
  };

  if (type === 'import') {
    return (
      <CodeBlock className="language-jsx">{`import colors from "erxes-ui/lib/styles/colors";`}</CodeBlock>
    );
  }

  if (type === 'rgb') {
    return (
      <>
        <div
          onClick={() => {
            copyToClipBoard(type);
          }}
          style={{
            background: rgb('#673FBD'),
            height: '40px',
            width: '150px',
            borderRadius: '15px'
          }}
        ></div>
        <CodeBlock className="language-jsx">{`background: rgb('#673FBD')`}</CodeBlock>
      </>
    );
  }
  if (type === 'rgba') {
    return (
      <>
        <div
          onClick={() => {
            copyToClipBoard(type);
          }}
          style={{
            background: rgba('#673FBD', 0.2),
            height: '40px',
            width: '150px',
            borderRadius: '15px'
          }}
        ></div>
        <CodeBlock className="language-jsx">{`background: rgba('#673FBD', 0.2)`}</CodeBlock>
      </>
    );
  }
  if (type === 'darken') {
    return (
      <>
        <div
          onClick={() => {
            copyToClipBoard(type);
          }}
          style={{
            background: darken('#673FBD', 30),
            height: '40px',
            width: '150px',
            borderRadius: '15px'
          }}
        ></div>
        <CodeBlock className="language-jsx">{`background: darken("#673FBD", 30)`}</CodeBlock>
      </>
    );
  }
  if (type === 'lighten') {
    return (
      <>
        <div
          onClick={() => {
            copyToClipBoard(type);
          }}
          style={{
            background: lighten('#673FBD', 30),
            height: '40px',
            width: '150px',
            borderRadius: '15px'
          }}
        ></div>
        <CodeBlock className="language-jsx">{`background: lighten("#673FBD", 30)`}</CodeBlock>
      </>
    );
  }

  return <div className={styles.test}>test</div>;
}
