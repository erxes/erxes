import React from "react";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import ApiTable from "./common.js"
import Chip from "erxes-ui/lib/components/Chip";
import Icon from "erxes-ui/lib/components/Icon";
import Button from "erxes-ui/lib/components/Button"

export function TipComponent(){
  const icon = <Icon icon="info-circle" size={100}></Icon>
  return(
  <>
    <Chip frontContent={icon}>
    <p>hello</p><Button>hehe</Button></Chip>
  </>
)
}