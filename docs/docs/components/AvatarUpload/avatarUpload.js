import React from "react";
import AvatarUpload from "erxes-ui/lib/components/AvatarUpload";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import { Upload } from "react-feather";

export function AvatarComponent(props) {
  const { type, table = [] } = props;

  const propDatas = (propName) => {
    const datas = {
        defaultAvatar: "https://erxes.io/static/images/logo/logo_dark_3x.png",
      avatar: propName && "https://erxes.io/static/images/logo/glyph_dark.png"
    };
    return datas;
  };

  const renderBlock = (propName, ) => {
    return (
      <>
        <div className={styles.styled}>
          <AvatarUpload {...propDatas(propName)} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<AvatarUpload ${stringify(propDatas(propName))} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "defaultAvatar") {
    return renderBlock();
  }

  if (type === "avatar") {
    return renderBlock("avatar");
  }

  if (type === "APIavatarUpload") {
    return renderApiTable("AvatarUpload", table);
  }

  return null;
}
