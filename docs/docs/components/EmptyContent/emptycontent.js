import React from "react";
import EmptyContent from "erxes-ui/lib/components/empty/EmptyContent";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import Table from "erxes-ui/lib/components/table/index";

export function EmptyContentComponent(props) {
  const { type, value } = props;

  const step = () => {
    const steped=[];
    const st = {
      title: "Title of step",
      description: "Description of step. Description of step. Description of step. Description of step. Description of step. ",
      url: type === "url" || type === "urltext" || type === "out" ? "/": false,
      urlText: type === "urltext" || type === "out" ? "urlText" : false, 
      icon: type === "icon" && "lightbulb-alt",
      isOutside: type === "out" && true,
    }
    if(type === "vertical"){
      steped.push(st);   
    }
    steped.push(st);
    return steped;
  }

  const contentdata = (title, url) => {
    const datas = {
      title: title && title,
      description: title && "Description",
      steps: step(),
      url: url && url,
      urlText: url && "url Text",
    };
    return datas;
  };

  const propDatas = (propName) => {
    if(propName){
      const kind = {
      [propName]: value,
    };
    return kind;
  }  
  return {};
  };

  const renderBlock = (title, propName, url ) => {
    return (
      <>
        <EmptyContent content={{ ...contentdata(title, url) }} {...propDatas(propName)} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<EmptyContent content=${JSON.stringify(contentdata(title, url)) } ${JSON.stringify(propDatas(propName))} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if(type === "contentTitle"){
    return renderBlock("Title");
  }
  
  if(type === "contenturl"){
    return renderBlock("Title", "", "url");
  }

  if(type === "vertical"){
    return renderBlock("Title", "vertical", "");
  }

  if(type === "max"){
    return renderBlock("Title", "maxItemWidth", "");
  }

  if(type === "APIempty"){
    return (
      <>
        <CodeBlock className="language-javascript">{`import Namecard from "erxes-ui/lib/components/namecard/Namecard";`}</CodeBlock>
        <p className={styles.required}>* required prop</p>
        <Table>
          <thead>
            <tr>
              <th colSpan="3">Name</th>
              <th>Type</th>
              <th>Defualt</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan="10">* content</td>
              <td rowSpan="6">steps</td>
              <td>title</td>
              <td>string</td>
              <td/>
              <td>Define title of step</td>
            </tr>
            <tr>
              <td>description</td>
              <td>string</td>
              <td/>
              <td>Define description of step</td>
              </tr>
              <tr>
              <td>url</td>
              <td>string</td>
              <td/>
              <td>Define url of button</td>
              </tr>
              <tr>
              <td>urlText</td>
              <td>string</td>
              <td/>
              <td>Define url text of button</td>
              </tr>
              <tr>
              <td>icon</td>
              <td>string</td>
              <td/>
              <td>Replaces step number with icon</td>
              </tr>
              <tr>
              <td>isOutside</td>
              <td>boolean</td>
              <td/>
              <td>Hides button link</td>
              </tr>
            <tr>
              <td colSpan="2">title</td>
              <td>string</td>
              <td/>
              <td>Define title of content</td>
            </tr>
            <tr>
              <td colSpan="2">description</td>
              <td>string</td>
              <td/>
              <td>Define description of content</td>
            </tr>
            <tr>
              <td colSpan="2">url</td>
              <td>string</td>
              <td/>
              <td>Define url link of content</td>
            </tr>
            <tr>
              <td colSpan="2">urlText</td>
              <td>string</td>
              <td/>
              <td>Define url text of content</td>
            </tr>
            <tr>
              <td colSpan="3">vertical</td>
              <td>boolean</td>
              <td/>
              <td>Shows content box vertically</td>
            </tr>
            <tr>
              <td colSpan="3">maxItemWidth</td>
              <td>string</td>
              <td/>
              <td>Declare max width of content box</td>
            </tr>
          </tbody>
        </Table>
      </>
      )
  }
  
  return renderBlock();
}
