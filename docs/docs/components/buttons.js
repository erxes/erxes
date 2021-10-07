import React from "react";
import ReactDOM from 'react-dom';
import Button from "erxes-ui/lib/components/Button";
import styles from "../../src/components/styles.module.css";
import CodeBlock from '@theme/CodeBlock';
import { Router, Route, Link, browserHistory, IndexRoute  } from 'react-router'

function Types() {
  return (<>
    <div className={styles.styled}>
        <Button >Default</Button>
        <Button btnStyle="primary" uppercase = 'true'>Primary</Button>
        <Button btnStyle="success">Success</Button>
        <Button btnStyle="danger">Danger</Button>
        <Button btnStyle="warning">Warning</Button>
        <Button btnStyle="simple">Simple</Button>
        <Button btnStyle="link">Link</Button>
    </div>
    <CodeBlock className="language-jsx">{`<>
        <Button>Default</Button>
        <Button btnStyle="primary">Primary</Button>
        <Button btnStyle="success">Success</Button>
        <Button btnStyle="danger">Danger</Button>
        <Button btnStyle="warning">Warning</Button> 
        <Button btnStyle="simple">Simple</Button>
        <Button btnStyle="link">Link</Button>
</>`}</CodeBlock>
    </>
  );
}


function Sizes() {
  return (<>
    <div className={styles.styled}>
        <Button btnStyle="primary" size="large">Large Primary</Button>
        <Button btnStyle="primary" size="medium">Medium Primary</Button>
        <Button btnStyle="primary" size="small">Small Primary</Button>
    </div>
    <CodeBlock className="language-jsx">{`<>
        <Button btnStyle="primary" size="large">Large Primary</Button>
        <Button btnStyle="primary" size="medium">Medium Primary</Button>
        <Button btnStyle="primary" size="small">Small Primary</Button>
</>`}</CodeBlock>
  </>
  );
}

function Activity() {
  return (<>
    <div className={styles.styled}>
        <Button btnStyle="primary">Normal button</Button>
        <Button btnStyle="primary" disabled>Disabled button</Button>
    </div>
    <CodeBlock className="language-jsx">{`<>
        <Button btnStyle="primary">Normal button</Button>
        <Button btnStyle="primary" disabled>Disabled button</Button>
</>`}</CodeBlock>
    </>
  );
};

function Uppercase() {
  return (<>
    <div className={styles.styled}>
        <Button>Normal button</Button>
        <Button uppercase>Uppercase button</Button>
    </div>
    <CodeBlock className="language-jsx">{`<>
        <Button>Normal button</Button>
        <Button uppercase>Uppercase button</Button>
</>`}</CodeBlock>
    </>
  )
}

function Block() {
  return (<>
    <div className={styles.styled}>
        <Button btnStyle="primary">Normal button</Button>
        <Button btnStyle="primary" block>Block button</Button>
    </div>
    <CodeBlock className="language-jsx">{`<>
        <Button btnStyle="primary">Normal button</Button>
        <Button btnStyle="primary" block>Block button</Button>
</>`}</CodeBlock>
    </>
  )
}

export { Types, Sizes, Activity, Uppercase, Block }