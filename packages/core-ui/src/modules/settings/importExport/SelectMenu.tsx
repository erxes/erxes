import { BoxRoot, FullContent } from "@erxes/ui/src/styles/main";

import { IImportHistory } from "./types";
import Icon from "@erxes/ui/src/components/Icon";
import { Link } from "react-router-dom";
import React from "react";
import Wrapper from "modules/layout/components/Wrapper";
import { __ } from "@erxes/ui/src/utils";
import { colors } from "@erxes/ui/src/styles";
import styled from "styled-components";

const Box = styled(BoxRoot)`
  width: 320px;
  padding: 40px;
  background: ${colors.bgLight};

  i {
    font-size: 38px;
    color: ${colors.colorSecondary};
  }

  span {
    font-weight: 500;
    text-transform: capitalize;
  }

  p {
    margin: 10px 0 0;
    font-size: 12px;
    color: ${colors.colorCoreLightGray};
    min-height: 36px;
  }

  &:last-of-type {
    margin-right: 0;
  }
`;

type Props = {
  onChange: (name: "method", value: string) => void;
  method: string;
  histories: IImportHistory[];
  loading: boolean;
  totalCount: number;
  currentType: string;
  removeHistory: (historyId: string, contentType: string) => void;
};

class SelectMenu extends React.Component<Props> {
  renderBox(name, icon, desc, path) {
    return (
      <Box $selected={this.props.method === name}>
        <Link to={path}>
          <Icon icon={icon} />
          <span>{__(name)}</span>
          <p>{__(desc)}</p>
        </Link>
      </Box>
    );
  }

  render() {
    const breadcrumb = [
      { title: __("Settings"), link: "/settings" },
      { title: __("Import & Export"), link: "/settings/selectMenu" },
    ];
    return (
      <>
        <Wrapper
          header={
            <Wrapper.Header title={__("Exports")} breadcrumb={breadcrumb} />
          }
          content={""}
          transparent={true}
        />
        <FullContent $center={true}>
          {this.renderBox("Import", "import", ` `, `/settings/importHistories`)}
          {this.renderBox("Export", "export", " ", `/settings/exportHistories`)}
        </FullContent>
      </>
    );
  }
}

export default SelectMenu;
