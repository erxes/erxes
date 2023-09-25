import BreadCrumb from "../../common/breadcrumb/BreadCrumb";
import Filter from "../../common/filter/Filter";
import { IBreadCrumbItem } from "../../types";
import { PageHeader } from "../styles";
import React from "react";
import Submenu from "../../common/subMenu/Submenu";
import { __ } from "../../../utils";
import { setTitle } from "../../utils";

type Props = {
  breadcrumb?: IBreadCrumbItem[];
  submenu?: IBreadCrumbItem[];
  queryParams?: any;
  title: string;
  additionalMenuItem?: React.ReactNode;
};

class Header extends React.Component<Props> {
  setTitle() {
    const { title } = this.props;

    setTitle(
      title,
      title === `${__("Team Inbox")}` && document.title.startsWith("(1)")
    );
  }

  componentDidUpdate() {
    this.setTitle();
  }

  componentDidMount() {
    this.setTitle();
  }

  render() {
    const { breadcrumb, submenu, queryParams, additionalMenuItem } = this.props;

    return (
      <PageHeader>
        {breadcrumb && <BreadCrumb breadcrumbs={breadcrumb} />}
        {submenu && (
          <Submenu items={submenu} additionalMenuItem={additionalMenuItem} />
        )}
        {queryParams && <Filter queryParams={queryParams} />}
      </PageHeader>
    );
  }
}

export default Header;
