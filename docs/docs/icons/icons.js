import React, { useState } from "react";
import styles from "../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import Icon from "erxes-ui/lib/components/Icon";
import Alert from "erxes-ui/lib/utils/Alert/index";

export function IconsComponent(props) {
  const { icons, type } = props;

  var [search, setSearch] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");

  const copyToClipBoard = async (copyMe) => {
    try {
      await navigator.clipboard.writeText(copyMe);
      setCopySuccess("Copied!");
      Alert.success("Copied!", 1000);
    } catch (err) {
      setCopySuccess("Failed to copy!");
    }
  };

  const searchHandler = (e) => {
    let keyword = e.target.value;
    setSearch((search = keyword));
  };

  const items = icons
    .filter((data) => {
      if (search == null) return data;
      else if (data.toLowerCase().includes(search.toLowerCase())) {
        return data;
      }
    })
    .map((data) => {
      return (
        <div
          onClick={() => {
            copyToClipBoard(data);
          }}
          className={styles.iconWrapper}
        >
          <div className={styles.iconButton}>
              <Icon icon={data} size={30} />
              <br />
          </div>
          <br />
          {data}
        </div>
      );
    });

  return (
    <>
      <input type="search" placeholder="Search..." onChange={(e) => searchHandler(e)} className={styles.searchBar} />
      <div className={styles.test}>{items}</div>
    </>
  );
}
