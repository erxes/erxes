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
        <p>Use any of the available infos style types to quickly create a styled infos. Just modify the <b><u>btnStyle</u></b> prop.</p>
        <div className={styles.tab}>
          <div className={styles.styled}>
            <Info>Default</Info>{' '}
            
          </div>
          
        </div>
        {/* <Button btnStyle="primary" size="large">Large button</Button> */}
      </div>
      
    </div>
    
  );
}