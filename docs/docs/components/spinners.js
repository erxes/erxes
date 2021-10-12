import React from "react";
import Spinner from "erxes-ui/lib/components/Spinner";
import styles from "../../src/components/styles.module.css";
import CodeBlock from '@theme/CodeBlock';
import "erxes-icon/css/erxes.min.css";

function Objective() {
  return (<>
    <div className={styles.styled}>
      <Spinner left="5%" objective/>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Spinner left="5%" objective/>
</>`}</CodeBlock>
    </>
  );
}

function Size() {
  return (<>
    <div className={styles.styled}>
      <div className={styles.spinner}>
        <Spinner size="15" left="10%" bottom="0" top="auto" objective />
      </div>
      <div className={styles.spinner}>
        <Spinner size="40" left="7%" bottom="0" top="auto" objective />
      </div>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Spinner size="15" objective />
      <Spinner size="40" objective />
</>`}</CodeBlock>
    </>
  );
}

function Position() {
  return (<>
    <div className={styles.styled}>
      <div className={styles.spinnerPos}>
        <Spinner left="5%" objective />
      </div>
      <div className={styles.spinnerPos}>
        <Spinner objective />
      </div>
      <div className={styles.spinnerPos}>
        <Spinner right="5%" left="auto" objective />
      </div>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Spinner left="5%" objective />
      <Spinner objective />
      <Spinner right="5%" left="auto" objective />
</>`}</CodeBlock>
    </>
  );
}

export { Objective, Size, Position }