import React from "react";
import AvatarUpload from "erxes-ui/lib/components/AvatarUpload";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";

export function AvatarComponent(props) {
  const { type, table = [] } = props;

  const stringify = (datas) => {
    let string = JSON.stringify(datas);
    string = string.replace(/{}/g, "");
    string = string.replace(/{"/g, "");
    string = string.replace(/":/g, "=");
    string = string.replace(/,"/g, " ");
    string = string.replace(/}/g, "");
    string = string.replace(/=true/g, "");
    string = string.replace(/ avatar=false/g, "");

    return string;
  };

  const propDatas = () => {
    const datas = {
      defaultAvatar: "https://erxes.io/static/images/logo/logo_dark_3x.png",
      avatar:
        type === "avatar" &&
        "https://erxes.io/static/images/logo/glyph_dark.png",
        onAvatarUpload: (response) => {},
    };
    return datas;
  };

  const renderBlock = () => {
    return (
      <>
        <div className={styles.styled}>
          <AvatarUpload {...propDatas()} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<AvatarUpload ${stringify(propDatas())} />\n</>`}
        </CodeBlock>
      </>
    );
  };
  
  if (type === "APIavatarUpload") {
    return renderApiTable("AvatarUpload", table);
  }

  return renderBlock();
}
