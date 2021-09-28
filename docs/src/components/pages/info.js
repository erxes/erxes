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
        <p>
          Use any of the available infos style types to quickly create a styled
          infos. Just modify the{" "}
          <b>
            <u>btnStyle</u>
          </b>{" "}
          prop.
        </p>
        <div className={styles.tab}>
          <div className={styles.styled}>
            <Info iconShow="https://erxes.s3.amazonaws.com/icons/sad.svg" title ="Default" >This is default info</Info> 
            <Info type="info" title="Info">This is info</Info>{" "}
            <Info type="danger" title="Danger">This is danger info</Info>{" "}
            <Info type="warning" title="Warning">This is warning info</Info>{" "}
            <Info type="success" title="Success">This is success info</Info>{" "}
          </div>
        </div>
        {/* <Button btnStyle="primary" size="large">Large button</Button> */}
      </div>
    </div>
  );
}
