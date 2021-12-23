import React, { useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import Button from "erxes-ui/lib/components/Button";
import Alert from "erxes-ui/lib/utils/Alert/index";

export function AlertComponent(props) {
  const {type}=props;

  if(type==="time"){
    return (<>
    <Button onClick={() => {Alert.info("Default")}}>Default time</Button>
    <Button >Custom time</Button>
    <CodeBlock className="language-jsx">
    {`const infoAlert = () => {
    Alert.info("Info alert", 1000);
  }`}
  </CodeBlock>
  </>)
  }

  return(<>
    <Button btnStyle="primary" onClick={() => {Alert.info("Info alert");}} >Info alert</Button>
    <Button btnStyle="success" onClick={() => {Alert.success("Success alert");}} >Success alert</Button>
    <Button btnStyle="warning" onClick={() => {Alert.warning("Warning alert");}} >Warning alert</Button>
    <Button btnStyle="danger" onClick={() => {Alert.error("Error alert");}} >Error alert</Button>
    <CodeBlock className="language-jsx">
          {`<>
    <Button btnStyle="primary" onClick={() => {Alert.info("Info alert");}} >Info alert</Button>
    <Button btnStyle="success" onClick={() => {Alert.success("Success alert");}} >Success alert</Button>
    <Button btnStyle="warning" onClick={() => {Alert.warning("Warning alert");}} >Warning alert</Button>
    <Button btnStyle="danger" onClick={() => {Alert.error("Error alert");}} >Error alert</Button>\n</>`}
        </CodeBlock>
  </>)
}