import React from "react";
import Info from "erxes-ui/lib/components/Info";
import styles from "../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";

function Infos() {
  return (<>
    <div>
      <Info title="Default">This is default info</Info>
      <Info
        // iconShow="https://erxes.s3.amazonaws.com/icons/grinning.svg"
        type="primary"
        title="Primary"
      >This is primary info</Info>
      <Info type="info" title="Info" iconShow="info-circle">This is info</Info>
      <Info type="danger" title="Danger">This is danger info</Info>
      <Info type="warning" title="Warning">This is warning info</Info>
      <Info type="success" title="Success">This is success info</Info>
    </div>
    <CodeBlock className="language-jsx">{`<>
        <Info title="Default">This is default info</Info>
        <Info type="info" title="Info"> This is info </Info>
        <Info type="danger" title="Danger"> This is danger info </Info>
        <Info type="primary" title="Primary">This is primary info </Info>
        <Info type="warning" title="Warning"> This is warning info </Info>
        <Info type="success" title="Success"> This is success info </Info>
</>`}</CodeBlock>
    </>
  );
}

export { Infos }
