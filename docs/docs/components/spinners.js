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
      <Spinner size="15" left="4%" objective />
      <Spinner size="40" left="7%" objective />
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
      <Spinner objective />
      <Spinner left="5%" objective />
      <Spinner right="5%" left="auto" objective />
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Spinner objective />
      <Spinner left="5%" objective />
      <Spinner right="5%" left="auto" objective />
</>`}</CodeBlock>
    </>
  );
}

export { Objective, Size, Position }