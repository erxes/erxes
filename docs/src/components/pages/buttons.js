import React from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../styles.module.css";

export default function Buttons() {
  return (
    <div className="container">
      <div className="title">
        <h1>Buttons</h1>
        <p>Custom button styles for actions in forms, dialogs, and more with support for multiple sizes, states, and more.</p>
      </div>
      <div className="examples">
        <h1>Examples</h1>
        <p>Use any of the available button style types to quickly create a styled button. Just modify the <b><u>btnStyle</u></b> prop.</p>
        <div className={styles.exampleTab}>
          <div className={styles.styledButtons}>
            <Button>Default</Button>{' '}
            <Button btnStyle="primary">Primary</Button>{' '}
            <Button btnStyle="success">Success</Button>{' '}
            <Button btnStyle="danger">Danger</Button>{' '}
            <Button btnStyle="warning">Warning</Button>{' '}
            <Button btnStyle="simple">Simple</Button>{' '}
            <Button btnStyle="link">Link</Button>{' '}
            
          </div>
          <div className={styles.codes}>
            {/* <textarea> */}
              &lt;&gt;
              &lt;Button btnStyle="primary"&gt;Primary&lt;/Button&gt;{' '}
              &lt;Button btnStyle="success"&gt;Success&lt;/Button&gt;{' '}
              &lt;Button btnStyle="danger"&gt;Danger&lt;/Button&gt;{' '}
              &lt;Button btnStyle="warning"&gt;Warning&lt;/Button&gt;{' '}
              &lt;Button btnStyle="simple"&gt;Simple&lt;/Button&gt;{' '}
              &lt;Button btnStyle="link"&gt;Link&lt;/Button&gt;{' '}
              &lt;/&gt;
            
            {/* </textarea> */}
          </div>
        </div>
        {/* <Button btnStyle="primary" size="large">Large button</Button> */}
      </div>
      <div className="sizes">
        <h1>Sizes</h1>
        <p>Fancy larger or smaller buttons? Add <b><u>size="large"</u></b>, <b><u>size="medium"</u></b>, <b><u>size="small"</u></b> for additional sizes.</p>
        <div className={styles.sizesTab}>
          <div className={styles.styledButtons}>
            <Button btnStyle="primary" size="large">Large Primary</Button>{' '}
            <Button btnStyle="primary" size="small">Small Primary</Button>{' '}
            <Button btnStyle="success" size="large">Large Success</Button>{' '}
            <Button btnStyle="success" size="small">Small Success</Button>{' '}
            
          </div>
          <div className={styles.codes}>
            {/* <textarea> */}
              &lt;&gt;
              &lt;Button btnStyle="primary"&gt;Primary&lt;/Button&gt;{' '}
              &lt;Button btnStyle="success"&gt;Success&lt;/Button&gt;{' '}
              &lt;Button btnStyle="danger"&gt;Danger&lt;/Button&gt;{' '}
              &lt;Button btnStyle="warning"&gt;Warning&lt;/Button&gt;{' '}
              &lt;Button btnStyle="simple"&gt;Simple&lt;/Button&gt;{' '}
              &lt;Button btnStyle="link"&gt;Link&lt;/Button&gt;{' '}
              &lt;/&gt;
            
            {/* </textarea> */}
          </div>
        </div>
      </div>
      <div className="sizes">
        <h1>Sizes</h1>
        <p>Fancy larger or smaller buttons? Add <b><u>size="large"</u></b>, <b><u>size="medium"</u></b>, <b><u>size="small"</u></b> for additional sizes.</p>
        <div className={styles.sizesTab}>
          <div className={styles.styledButtons}>
            <Button btnStyle="primary" size="large">Large Primary</Button>{' '}
            <Button btnStyle="primary" size="small">Small Primary</Button>{' '}
            <Button btnStyle="success" size="large">Large Success</Button>{' '}
            <Button btnStyle="success" size="small">Small Success</Button>{' '}
            
          </div>
          <div className={styles.codes}>
            {/* <textarea> */}
              &lt;&gt;
              &lt;Button btnStyle="primary"&gt;Primary&lt;/Button&gt;{' '}
              &lt;Button btnStyle="success"&gt;Success&lt;/Button&gt;{' '}
              &lt;Button btnStyle="danger"&gt;Danger&lt;/Button&gt;{' '}
              &lt;Button btnStyle="warning"&gt;Warning&lt;/Button&gt;{' '}
              &lt;Button btnStyle="simple"&gt;Simple&lt;/Button&gt;{' '}
              &lt;Button btnStyle="link"&gt;Link&lt;/Button&gt;{' '}
              &lt;/&gt;
            
            {/* </textarea> */}
          </div>
        </div>
      </div>
      <div className="sizes">
        <h1>Sizes</h1>
        <p>Fancy larger or smaller buttons? Add <b><u>size="large"</u></b>, <b><u>size="medium"</u></b>, <b><u>size="small"</u></b> for additional sizes.</p>
        <div className={styles.sizesTab}>
          <div className={styles.styledButtons}>
            <Button btnStyle="primary" size="large">Large Primary</Button>{' '}
            <Button btnStyle="primary" size="small">Small Primary</Button>{' '}
            <Button btnStyle="success" size="large">Large Success</Button>{' '}
            <Button btnStyle="success" size="small">Small Success</Button>{' '}
            
          </div>
          <div className={styles.codes}>
            {/* <textarea> */}
              &lt;&gt;
              &lt;Button btnStyle="primary"&gt;Primary&lt;/Button&gt;{' '}
              &lt;Button btnStyle="success"&gt;Success&lt;/Button&gt;{' '}
              &lt;Button btnStyle="danger"&gt;Danger&lt;/Button&gt;{' '}
              &lt;Button btnStyle="warning"&gt;Warning&lt;/Button&gt;{' '}
              &lt;Button btnStyle="simple"&gt;Simple&lt;/Button&gt;{' '}
              &lt;Button btnStyle="link"&gt;Link&lt;/Button&gt;{' '}
              &lt;/&gt;
            
            {/* </textarea> */}
          </div>
        </div>
      </div>
      <div className="sizes">
        <h1>Sizes</h1>
        <p>Fancy larger or smaller buttons? Add <b><u>size="large"</u></b>, <b><u>size="medium"</u></b>, <b><u>size="small"</u></b> for additional sizes.</p>
        <div className={styles.sizesTab}>
          <div className={styles.styledButtons}>
            <Button btnStyle="primary" size="large">Large Primary</Button>{' '}
            <Button btnStyle="primary" size="small">Small Primary</Button>{' '}
            <Button btnStyle="success" size="large">Large Success</Button>{' '}
            <Button btnStyle="success" size="small">Small Success</Button>{' '}
            
          </div>
          <div className={styles.codes}>
            {/* <textarea> */}
              &lt;&gt;
              &lt;Button btnStyle="primary"&gt;Primary&lt;/Button&gt;{' '}
              &lt;Button btnStyle="success"&gt;Success&lt;/Button&gt;{' '}
              &lt;Button btnStyle="danger"&gt;Danger&lt;/Button&gt;{' '}
              &lt;Button btnStyle="warning"&gt;Warning&lt;/Button&gt;{' '}
              &lt;Button btnStyle="simple"&gt;Simple&lt;/Button&gt;{' '}
              &lt;Button btnStyle="link"&gt;Link&lt;/Button&gt;{' '}
              &lt;/&gt;
            
            {/* </textarea> */}
          </div>
        </div>
      </div>
      <div className="sizes">
        <h1>Sizes</h1>
        <p>Fancy larger or smaller buttons? Add <b><u>size="large"</u></b>, <b><u>size="medium"</u></b>, <b><u>size="small"</u></b> for additional sizes.</p>
        <div className={styles.sizesTab}>
          <div className={styles.styledButtons}>
            <Button btnStyle="primary" size="large">Large Primary</Button>{' '}
            <Button btnStyle="primary" size="small">Small Primary</Button>{' '}
            <Button btnStyle="success" size="large">Large Success</Button>{' '}
            <Button btnStyle="success" size="small">Small Success</Button>{' '}
            
          </div>
          <div className={styles.codes}>
            {/* <textarea> */}
              &lt;&gt;
              &lt;Button btnStyle="primary"&gt;Primary&lt;/Button&gt;{' '}
              &lt;Button btnStyle="success"&gt;Success&lt;/Button&gt;{' '}
              &lt;Button btnStyle="danger"&gt;Danger&lt;/Button&gt;{' '}
              &lt;Button btnStyle="warning"&gt;Warning&lt;/Button&gt;{' '}
              &lt;Button btnStyle="simple"&gt;Simple&lt;/Button&gt;{' '}
              &lt;Button btnStyle="link"&gt;Link&lt;/Button&gt;{' '}
              &lt;/&gt;
            
            {/* </textarea> */}
          </div>
        </div>
      </div>
      <div className="sizes">
        <h1>Sizes</h1>
        <p>Fancy larger or smaller buttons? Add <b><u>size="large"</u></b>, <b><u>size="medium"</u></b>, <b><u>size="small"</u></b> for additional sizes.</p>
        <div className={styles.sizesTab}>
          <div className={styles.styledButtons}>
            <Button btnStyle="primary" size="large">Large Primary</Button>{' '}
            <Button btnStyle="primary" size="small">Small Primary</Button>{' '}
            <Button btnStyle="success" size="large">Large Success</Button>{' '}
            <Button btnStyle="success" size="small">Small Success</Button>{' '}
            
          </div>
          <div className={styles.codes}>
            {/* <textarea> */}
              &lt;&gt;
              &lt;Button btnStyle="primary"&gt;Primary&lt;/Button&gt;{' '}
              &lt;Button btnStyle="success"&gt;Success&lt;/Button&gt;{' '}
              &lt;Button btnStyle="danger"&gt;Danger&lt;/Button&gt;{' '}
              &lt;Button btnStyle="warning"&gt;Warning&lt;/Button&gt;{' '}
              &lt;Button btnStyle="simple"&gt;Simple&lt;/Button&gt;{' '}
              &lt;Button btnStyle="link"&gt;Link&lt;/Button&gt;{' '}
              &lt;/&gt;
            
            {/* </textarea> */}
          </div>
        </div>
      </div>
      <div className="sizes">
        <h1>Sizes</h1>
        <p>Fancy larger or smaller buttons? Add <b><u>size="large"</u></b>, <b><u>size="medium"</u></b>, <b><u>size="small"</u></b> for additional sizes.</p>
        <div className={styles.sizesTab}>
          <div className={styles.styledButtons}>
            <Button btnStyle="primary" size="large">Large Primary</Button>{' '}
            <Button btnStyle="primary" size="small">Small Primary</Button>{' '}
            <Button btnStyle="success" size="large">Large Success</Button>{' '}
            <Button btnStyle="success" size="small">Small Success</Button>{' '}
            
          </div>
          <div className={styles.codes}>
            {/* <textarea> */}
              &lt;&gt;
              &lt;Button btnStyle="primary"&gt;Primary&lt;/Button&gt;{' '}
              &lt;Button btnStyle="success"&gt;Success&lt;/Button&gt;{' '}
              &lt;Button btnStyle="danger"&gt;Danger&lt;/Button&gt;{' '}
              &lt;Button btnStyle="warning"&gt;Warning&lt;/Button&gt;{' '}
              &lt;Button btnStyle="simple"&gt;Simple&lt;/Button&gt;{' '}
              &lt;Button btnStyle="link"&gt;Link&lt;/Button&gt;{' '}
              &lt;/&gt;
            
            {/* </textarea> */}
          </div>
        </div>
      </div>
    </div>
  );
}