import React from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../src/components/styles.module.css";
import CodeBlock from '@theme/CodeBlock';
import "erxes-icon/css/erxes.min.css";

function Types() {
  return (<>
    <div className={styles.styled}>
      <Button >Default</Button>
      <Button btnStyle="primary">Primary</Button>
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
      <Button size="large">Large Primary</Button>
      <Button size="medium">Medium Primary</Button>
      <Button size="small">Small Primary</Button>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Button size="large">Large Primary</Button>
      <Button size="medium">Medium Primary</Button>
      <Button size="small">Small Primary</Button>
</>`}</CodeBlock>
  </>
  );
}

function Activity() {
  return (<>
    <div className={styles.styled}>
      <Button>Normal button</Button>
      <Button disabled>Disabled button</Button>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Button>Normal button</Button>
      <Button disabled>Disabled button</Button>
</>`}</CodeBlock>
    </>
  );
};

function Uppercase() {
  return (<>
    <div className={styles.styled}>
      <Button uppercase>Uppercase button</Button>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Button uppercase>Uppercase button</Button>
</>`}</CodeBlock>
    </>
  )
}

function Block() {
  return (<>
    <div className={styles.styled}>
      <Button block>Full-width button</Button>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Button block>Full-width button</Button>
</>`}</CodeBlock>
    </>
  )
}

function Icon() {
  return (<>
    <div className={styles.styled}>
      <Button btnStyle="primary" icon="envelope-alt">Primary</Button>
      <Button btnStyle="success" icon="check-circle">Success</Button>
      <Button btnStyle="danger" icon="times-circle">Danger</Button>
      <Button btnStyle="warning" icon="exclamation-triangle">Warning</Button>
      <Button btnStyle="simple" icon="info-circle">Simple</Button>
      <Button btnStyle="link" icon="link">Link</Button>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Button btnStyle="primary" icon="envelope-alt">Primary</Button>
      <Button btnStyle="success" icon="check-circle">Success</Button>
      <Button btnStyle="danger" icon="times-circle">Danger</Button>
      <Button btnStyle="warning" icon="exclamation-triangle">Warning</Button>
      <Button btnStyle="simple" icon="info-circle">Simple</Button>
      <Button btnStyle="link" icon="link">Link</Button>
</>`}</CodeBlock>
    </>
  )
}

export { Types, Sizes, Activity, Uppercase, Block, Icon }