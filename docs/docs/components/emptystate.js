import React from "react";
import EmptyState from "erxes-ui/lib/components/EmptyState";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import Table from "../../../ui/src/modules/common/components/table";
import Button from "erxes-ui/lib/components/Button";

export function EmptyComponents(props) {
  const { type, table = [], icon, img, text, size } = props;

  if (type === "simple") {
    return (
      <>
        <div>
          <EmptyState key={Math.random()} icon={icon} text={text} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`\n\t<EmptyState icon="${icon}" text="${text}"/>`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "light") {
    return (
      <>
        <div>
          <EmptyState key={Math.random()} icon={icon} text={text} light />
        </div>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`\n\t<EmptyState icon="${icon}" text="${text}" light/>`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "size") {
    return (
      <>
        <div>
          <EmptyState key={Math.random()} icon={icon} text={text} size={size} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`\n\t<EmptyState icon="${icon}" text="${text}" size="${size}"/>`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "image") {
    return (
      <>
        <div>
          <EmptyState key={Math.random()} image={img} text={text} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`\n\t<EmptyState image="${img}" text="${text}"/>`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "extra") {
    return (
      <>
        <div>
          <EmptyState key={Math.random()} icon={icon} text={text} extra={<Button>Button</Button>} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`\n\t<EmptyState icon="${icon}" text="${text}" extra={<Button>Button</Button>} />`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "APIempty") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import EmptyState from "erxes-ui/lib/components/EmptyState";`}</CodeBlock>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr>
                {row.map((cell) => (
                  <td>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  return null;
}

// function Apiemptystate(){
// return(<>
// <CodeBlock className="language-jsx">{`import EmptyState from "erxes-ui/lib/components/EmptyState";`}</CodeBlock>
// <Table>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>type</th>
//             <th>description</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td>text</td>
//             <td>string</td>
//             <td>Show your text. If you want to show only text, use it with light prop.</td>
//           </tr>
//           <tr>
//             <td>icon</td>
//             <td>string</td>
//             <td>Show icon.</td>
//           </tr>
//           <tr>
//             <td>image</td>
//             <td>string</td>
//             <td>Show image.</td>
//           </tr>
//           <tr>
//             <td>size</td>
//             <td>string</td>
//             <td>Size of icon.</td>
//           </tr>
//           <tr>
//             <td>extra</td>
//             <td>node</td>
//             <td>Add other components or text.</td>
//           </tr>
//           <tr>
//             <td>light</td>
//             <td>boolean</td>
//             <td>Show only first row.</td>
//           </tr>
//         </tbody>
//       </Table>
//   </>
// )
// }

// export { Emptystate, Emptyimg, Emptyextra, Emptysize, Emptylight, Apiemptystate };
