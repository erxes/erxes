import React, { useRef, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import styles from "./styles.module.css";

const MenuItem = (props) => {
  const { name, onClick, to, exact } = props;

  return (
    <li onClick={props.onClick}>
      <Link
        exact
        to={to}
        // onClick={() => {
        //   setExpand((e) => !e);
        // }}
        className={styles.menuItem}
      >
        {name}
      </Link>
    </li>
  );
};

export default MenuItem;