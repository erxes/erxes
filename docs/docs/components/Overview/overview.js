import React from "react";
import Button from "erxes-ui/lib/components/Button";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
// import { renderApiTable, stringify } from "../common.js";

export function Examples(props) {
  const { type } = props;

  const renderBlock = () => {
    if (type === "import") {
      return (
        <>
          <CodeBlock className="language-jsx">{`import React from "react";\nimport Button from "erxes-ui/lib/components/Button";\n\nconst App() {\n\treturn <Button>My button</Button>;\n}`}</CodeBlock>
        </>
      );
    }
    return (
      <>
        <Button>Default button</Button>
        <Button btnStyle="danger">Danger button</Button>
        <CodeBlock className="language-jsx">{`<Button>Default button</Button>\n<Button btnStyle="danger">Danger button</Button>`}</CodeBlock>
      </>
    );
  };

  return renderBlock();
}
