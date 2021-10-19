import React from "react";
import Spinner from "erxes-ui/lib/components/Spinner";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from '@theme/CodeBlock';
import "erxes-icon/css/erxes.min.css";
import { renderApiTable } from "../common.js";

export function SpinnerComponent(props) {
  const { type, sizes = [], lefts = [], rights = [], table = [] } = props;

  if (type === "size") {
    return (
      <>
        <div className={styles.styleSpinner}>
          {sizes.map((e) => (
            <div className={styles.spinner}>
              <Spinner key={Math.random()} size={e} objective/>
            </div>
          ))}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${sizes.map(
            (e) => `\n\t<Spinner size="${e}" objective/>`
          )}\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "position") {
    return (
      <>
        <div className={styles.styleSpinner}>
          {lefts.map((e, i) => (
            <div className={styles.spinnerPos}>
              <Spinner key={Math.random()} left={e} right={rights[i]} objective/>
            </div>
          ))}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${lefts.map(
            (e, i) => `\n\t<Spinner left="${e}" right="${rights[i]}" objective/>`
          )}\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "objective") {
    return (
      <>
        <div className={styles.styled}>
          <div className={styles.spinner}>
            <Spinner key={Math.random()} left="15%" objective/>
          </div>
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Spinner objective/>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "APIspinner") {
    return (
      <>
        {/* {Api("Spinner")}
        {ApiTable(table)} */}
      </>
    );
  }

  return null;
}