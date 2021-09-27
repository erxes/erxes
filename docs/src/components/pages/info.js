import React from "react";
import Info from "erxes-ui/lib/components/Info";
import styles from "../styles.module.css";

export default function Infos() {
  return (
    <div className="container">
      <div className="title">
        <h1>Info</h1>
        <p>Custom info styles for actions in inputs.</p>
      </div>
      <div className="examples">
        <h1>Examples</h1>
        <p>Use any of the available infos style types to quickly create a styled button. Just modify the <b><u>btnStyle</u></b> prop.</p>
        <div className={styles.tab}>
          <div className={styles.styledButtons}>
            <Info>Default</Info>{' '}
            
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
      
    </div>
  );
}