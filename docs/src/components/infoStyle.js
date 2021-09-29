import React from "react";
  import Info from "erxes-ui/lib/components/Info";
import styles from "./styles.module.css";


export const InfoStyle = (props) => {
  
  return(
    <div className="container">
      <div className="title"> 
        <h1>{props.title}</h1>
        <p>{props.titledef}</p>
      </div>
      <div className="examples">
        <h1>Examples</h1>
        <p>
          {props.definition}
        </p>
        <div className={styles.tab}>
          <div className={styles.styled}>
            <Info iconShow='https://erxes.s3.amazonaws.com/icons/grinning.svg' title ="Default" >This is default info</Info> 
            <Info type="info" title="Info"  iconShow= 'info-circle'>This is info</Info>{" "}
            <Info type="danger" title="Danger">This is  danger info</Info>{" "}
            <Info type="warning" title="Warning">This is warning info</Info>{" "}
            <Info type="success" title="Success">This is success info</Info>{" "}
          </div>
        </div>
      </div>
    </div>
  );
};
