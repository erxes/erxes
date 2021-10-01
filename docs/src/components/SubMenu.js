import React from "react";
import styles from "./styles.module.css";

export const menuItems = [
    {
      name: "Buttons",
      exact: true,
      to: "/components/buttons",
    },
    {
      name: "Info",
      exact: true,
      to: "/components/Info",
    },
];

const SubMenu = (props) => {

    return (
        <div className={styles.sideMenu}>
            {/* <div className="top-section">
                <div className="gettingStarted">
                    Getting Started
                </div>
                <div className="search-controller">
                    <input type="text" placeholder="Search..." />
                </div>
            </div> */}

            {/* <div className={styles.divider}></div> */}

            <div className={styles.title}>Components</div>

            <div className="mainMenu">
                <ul>
                    {menuItems.map((menuItem, index) => (
                        <MenuItem
                        key={index}
                        name={menuItem.name}
                        exact={menuItem.exact}
                        to={menuItem.to}
                        onClick={(e) => {
                            if (inactive) {
                            setInactive(false);
                            }
                        }}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SubMenu;