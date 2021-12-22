import React, { useState } from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import Icon from "erxes-ui/lib/components/Icon";
import Filter from "erxes-ui/lib/components/filterableList/Filter";

export function IconsComponent(props) {
  const { icons, type } = props;

  var [search, setSearch] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");

  const copyToClipBoard = async (copyMe) => {
    try {
      await navigator.clipboard.writeText(copyMe);
      setCopySuccess("Copied!");
      alert("Copied!");
    } catch (err) {
      setCopySuccess("Failed to copy!");
    }
  };

  const searchHandler = (e) => {
    let keyword = e.target.value;
    setSearch((search = keyword));
  };

  if (type ==="code"){
    return <CodeBlock className="language-javascript">{`import "erxes-icon/css/erxes.min.css";`}</CodeBlock>
  }

  const items = icons.filter((data) => {
      if (search == null) return data;
      else if (data.toLowerCase().includes(search.toLowerCase())) {
        return data;
      }}).map((data) => {
      return (
        <Button
          btnStyle="simple"
          onClick={() => {
            copyToClipBoard(data);
          }}
          className={styles.iconButton}
        >
          <div className={styles.iconWidth}>
            <Icon icon={data} size={25} />
            <br />
            {data}
          </div>
        </Button>
      );
    });

    return (
    <>
      <Filter onChange={(e) => searchHandler(e)} />
      {items}
    </>
  );
}
