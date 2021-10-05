import React from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../styles.module.css";
import {Link} from 'react-scroll'
// import StyledContainer from "../styledContainer";
import { CopyBlock, dracula } from "react-code-blocks";
// import CodeBox from "../codeBox";

export default function Buttons() {

  return (
    <div className={styles.mainCon}>
    <div className={styles.body}>
      <div id="button">
        <h1>Button</h1>
        <p>Custom button styles for actions in forms, dialogs, and more with support for multiple sizes, states, and more.</p>
      </div>
      <div id="examples">
        <h2>Examples</h2>
        <p>Use any of the available button style types to quickly create a styled button. Just modify the <b>btnStyle</b> prop.</p>
        <div className={styles.code}>
          <div className={styles.styled}>
            <Button>Default</Button>{' '}
            <Button btnStyle="primary">Primary</Button>{' '}
            <Button btnStyle="success">Success</Button>{' '}
            <Button btnStyle="danger">Danger</Button>{' '}
            <Button btnStyle="warning">Warning</Button>{' '}
            <Button btnStyle="simple">Simple</Button>{' '}
            <Button btnStyle="link">Link</Button>{' '}
          </div>
          <CopyBlock 
            language="jsx"
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
        <h2>Sizes</h2>
        <p>Fancy larger or smaller buttons? Add <b>size="large"</b>, <b>size="medium"</b>, <b>size="small"</b> for additional sizes.</p>
        <div className={styles.code}>
          <div>
          <Button btnStyle="primary" size="large">Large Primary</Button>{' '}
          <Button btnStyle="primary" size="medium">Medium Primary</Button>{' '}
          <Button btnStyle="primary" size="small">Small Primary</Button>{' '}
          </div>
          <CopyBlock
            language="html"
            text={`<>
            <Button btnStyle="primary" size="large">Large Primary</Button>{' '}
            <Button btnStyle="primary" size="medium">Medium Primary</Button>{' '}
            <Button btnStyle="primary" size="small">Small Primary</Button>{' '}
</>`}
            theme={dracula}
            showLineNumbers={false}
            codeBlock
          />
        </div>
      </div>
      <div>
        <h2>Disabled state</h2>
        <p>Make buttons look inactive by adding the <b>disabled</b> prop to.</p>
        <div className={styles.code}>
          <div>
          <Button btnStyle="primary" size="medium">Normal button</Button>
          <Button btnStyle="primary" size="medium" disabled>Disabled button</Button>
          </div>
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
    </div>
    <div className={styles.subMenu}>
      <li><Link to="button" spy={true} smooth={true} duration={500}>Button</Link></li>
      <li><Link to="examples" spy={true} smooth={true} duration={500}>Examples</Link></li>
    </div>

    </div>
  );
}
