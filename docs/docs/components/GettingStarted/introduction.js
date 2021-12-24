import React from "react";
import Button from "erxes-ui/lib/components/Button";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";

export function Examples(props) {
  const { type } = props;
  let content = ``;

  if (type === "import")
    [
      (content = `import React from "react";\nimport Button from "erxes-ui/lib/components/Button";\n\nconst App() {\n\treturn <Button>My button</Button>;\n}`),
    ];

  if (type === "install") [(content = `npm install erxes-ui`)];

  if (type === "css") [(content = `import "erxes-icon/css/erxes.min.css";`)];

  if (type === "clone") [(content = `https://github.com/erxes/erxes-ui`)];

  if (type === "erxes-ui")
    [
      (content = `rm -rf lib && yarn build && rm -rf ../my-project/node_modules/erxes-ui/lib && cp -r lib ../my-project/ui/node_modules/erxes-ui/`),
    ];

  const renderBlock = () => {
    return (
      <>
        <CodeBlock className="language-jsx">{content}</CodeBlock>
      </>
    );
  };

  return renderBlock();
}
