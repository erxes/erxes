import React from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../styles.module.css";
// import StyledContainer from "../styledContainer";
import { CopyBlock, dracula } from "react-code-blocks";
// import CodeBox from "../codeBox";

export default function Buttons() {

  return (
    <>
    <div>
      <h1>Button</h1>
      <p>Custom button styles for actions in forms, dialogs, and more with support for multiple sizes, states, and more.</p>
    </div>
    <div>
      <h1>Examples</h1>
      <p>Use any of the available button style types to quickly create a styled button. Just modify the <b><u>btnStyle</u></b> prop.</p>
      <div className={styles.code}>
        <div>
          <Button>Default</Button>{' '}
          <Button btnStyle="primary">Primary</Button>{' '}
          <Button btnStyle="success">Success</Button>{' '}
          <Button btnStyle="danger">Danger</Button>{' '}
          <Button btnStyle="warning">Warning</Button>{' '}
          <Button btnStyle="simple">Simple</Button>{' '}
          <Button btnStyle="link">Link</Button>{' '}
        </div><br/>
        <CopyBlock
          language="html"
          text={`<>
          <Button>Default</Button>{' '}
          <Button btnStyle="primary">Primary</Button>{' '}
          <Button btnStyle="success">Success</Button>{' '}
          <Button btnStyle="danger">Danger</Button>{' '}
          <Button btnStyle="warning">Warning</Button>{' '}
          <Button btnStyle="simple">Simple</Button>{' '}
          <Button btnStyle="link">Link</Button>{' '}
</>`}
          theme={dracula}
          showLineNumbers={false}
          codeBlock
        />
      </div>
    </div>
    <div>
      <h1>Sizes</h1>
      <p>Fancy larger or smaller buttons? Add <b><u>size="large"</u></b>, <b><u>size="medium"</u></b>, <b><u>size="small"</u></b> for additional sizes.</p>
      <div className={styles.code}>
        <div>
        <Button btnStyle="primary" size="large">Large Primary</Button>{' '}
        <Button btnStyle="primary" size="medium">Medium Primary</Button>{' '}
        <Button btnStyle="primary" size="small">Small Primary</Button>{' '}
        <Button btnStyle="success" size="large">Large Success</Button>{' '}
        <Button btnStyle="success" size="medium">Medium Success</Button>{' '}
        <Button btnStyle="success" size="small">Small Success</Button>{' '}
        </div><br/>
        <CopyBlock
          language="html"
          text={`<>
          <Button btnStyle="primary" size="large">Large Primary</Button>{' '}
          <Button btnStyle="primary" size="medium">Medium Primary</Button>{' '}
          <Button btnStyle="primary" size="small">Small Primary</Button>{' '}
          <Button btnStyle="success" size="large">Large Success</Button>{' '}
          <Button btnStyle="success" size="medium">Medium Success</Button>{' '}
          <Button btnStyle="success" size="small">Small Success</Button>{' '}
</>`}
          theme={dracula}
          showLineNumbers={false}
          codeBlock
        />
      </div>
    </div>
    <div>
      <h1>Disabled state</h1>
      <p>Make buttons look inactive by adding the <b><u>disabled</u></b> prop to.</p>
      <div className={styles.code}>
        <div>
        <Button btnStyle="primary" size="medium">Normal button</Button>
        <Button btnStyle="primary" size="medium" disabled>Disabled button</Button>
        </div><br/>
        <CopyBlock
          language="html"
          text={`<>
          <Button btnStyle="primary" size="medium">Normal button</Button>
          <Button btnStyle="primary" size="medium" disabled>Disabled button</Button>
</>`}
          theme={dracula}
          showLineNumbers={false}
          codeBlock
        />
      </div>
    </div>
    </>
    

  );
}
