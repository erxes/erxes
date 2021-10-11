import React from "react";
import Info from "erxes-ui/lib/components/Info";
import styles from "../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";

function Infos() {
  return (<>
    <div>
      <Info type="primary" title="Primary">This is primary info</Info>
      <Info type="info" title="Info">This is info</Info>
      <Info type="danger" title="Danger">This is danger info</Info>
      <Info type="warning" title="Warning">This is warning info</Info>
      <Info type="success" title="Success">This is success info</Info>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Info type="primary" title="Primary">This is primary info</Info>
      <Info type="info" title="Info">This is info</Info>
      <Info type="danger" title="Danger">This is danger info</Info>
      <Info type="warning" title="Warning">This is warning info</Info>
      <Info type="success" title="Success">This is success info</Info>
</>`}</CodeBlock>
    </>
  );
}

function InfoIcon() {
  return (<>
    <div>
      <Info type="primary" title="Primary" iconShow="envelope-alt">This is primary info</Info>
      <Info type="info" title="Info" iconShow="info-circle">This is info</Info>
      <Info type="danger" title="Danger" iconShow="times-circle">This is danger info</Info>
      <Info type="warning" title="Warning" iconShow="exclamation-triangle">This is warning info</Info>
      <Info type="success" title="Success" iconShow="check-circle">This is success info</Info>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Info type="primary" title="Primary" iconShow="envelope-alt">This is primary info</Info>
      <Info type="info" title="Info" iconShow="info-circle">This is info</Info>
      <Info type="danger" title="Danger" iconShow="times-circle">This is danger info</Info>
      <Info type="warning" title="Warning" iconShow="exclamation-triangle">This is warning info</Info>
      <Info type="success" title="Success" iconShow="check-circle">This is success info</Info>
</>`}</CodeBlock>
    </>
  );
}

export { InfoIcon, Infos }
