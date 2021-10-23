import React from "react";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";
import Toggle from "erxes-ui/lib/components/Toggle";


export function ToggleComponent(props){
  const {type, extra, table=[]} = props;

  const propDatas = (addition, extra) => {
    const kind = {
      [addition] : addition = true,
      [extra] : extra = true,

    }
    
    const datas = {
      ...kind,
    }
    return datas;
  }
  const renderBlock = (addition, extra) => {
  return (
    <>
    <Toggle 
    icons={{
      checked: <span>{'Yes'}</span>,
      unchecked: <span>{'No'}</span>
    }}
    {...propDatas(addition, extra)}
    />
    <CodeBlock className="language-jsx">
      {`<>\n<Toggle 
    icons={{
      checked: <span>{'Yes'}</span>,
      unchecked: <span>{'No'}</span>
    }}
    ${propDatas(addition, extra)}
    />\n</>`}
    </CodeBlock>
    </>
  );
};

if (type === "simple"){
  return renderBlock()
}

if (type === "checked"){
  return renderBlock("checked");
}

if(type === "defaultChecked"){
  return renderBlock("defaultChecked");
}

if (type === "disabled checked"){
  return renderBlock("disabled", "checked");
}

if (type === "disabled"){
  return renderBlock("disabled");
}

if (type === "ApiToggle"){
  return renderApiTable("Toggle", table);
}
return null;
}