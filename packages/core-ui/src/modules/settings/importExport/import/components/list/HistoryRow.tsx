import {
  ImportHistoryActions,
  ImportTitle,
} from "modules/settings/importExport/styles";
import { __, getEnv, readFile } from "modules/common/utils";

import Button from "modules/common/components/Button";
import { DateWrapper } from "modules/common/styles/main";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "modules/common/components/DropdownToggle";
import Icon from "modules/common/components/Icon";
import { Link } from "react-router-dom";
import React from "react";
import TextInfo from "@erxes/ui/src/components/TextInfo";
import Tip from "modules/common/components/Tip";
import dayjs from "dayjs";
import queryString from "query-string";
import { renderText } from "modules/settings/importExport/utils";
import { IImportHistory } from "../../../types";
import { IUser } from "modules/auth/types";

type Props = {
  history: IImportHistory;
  removeHistory: (historyId: string, contentType: string) => void;
};

const { REACT_APP_API_URL } = getEnv();

class HistoryRow extends React.Component<Props> {
  renderView = () => {
    const { history } = this.props;

    const { contentTypes } = history;

    if (contentTypes.length > 1) {
      return (
        <Dropdown
          toggleComponent={
            <Button btnStyle="simple" size="small">
              {__("View")} <Icon icon="angle-down" />
            </Button>
          }
          as={DropdownToggle}
          // className="dropdown-btn"
          // align="end"
        >
          {contentTypes.map((value) => {
            return (
              <li key={Math.random()}>
                <Link to={`/contacts/${value.contentType}`}>
                  {__(`View ${renderText(value.contentType)}`)}
                </Link>
              </li>
            );
          })}
        </Dropdown>
      );
    }

    return (
      <Button btnStyle="simple" size="small">
        <Link to={`/contacts/${contentTypes[0]}`} style={{ color: "#888" }}>
          {__(`View ${renderText(contentTypes[0])}`)}
        </Link>
      </Button>
    );
  };

  renderAction = () => {
    const { history } = this.props;
    const { attachments, contentTypes } = history;

    const renderDownloadFile = () => {
      return contentTypes.map((value) => {
        if (!attachments) {
          return null;
        }

        const attachment = attachments[value.contentType][0];

        return (
          <li key={Math.random()}>
            <a
              rel="noopener noreferrer"
              href={readFile(attachment.url)}
              target="_blank"
            >
              {__(`Download ${renderText(value.contentType)} file`)}
            </a>
          </li>
        );
      });
    };

    const renderDownloadErrorFile = () => {
      return contentTypes.map((value) => {
        const stringified = queryString.stringify({
          importHistoryId: history._id,
          contentType: value.contentType,
        });

        const reqUrl = `${REACT_APP_API_URL}/pl:workers/download-import-error?${stringified}`;

        return (
          <li key={Math.random()}>
            <a
              rel="noopener noreferrer"
              href={reqUrl}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              {__(`Download ${renderText(value.contentType)} errors`)}
            </a>
          </li>
        );
      });
    };

    const renderDelete = () => {
      const { removeHistory } = this.props;

      return contentTypes.map((value) => {
        const onClick = () => {
          removeHistory(history._id, value.contentType);
        };

        return (
          <li key={Math.random()}>
            <a onClick={onClick} href="# ">
              {__(`Delete ${renderText(value.contentType)}`)}
            </a>
          </li>
        );
      });
    };

    return (
      <Dropdown
        as={DropdownToggle}
        toggleComponent={
          <Button btnStyle="simple" size="small">
            {__("Actions")} <Icon icon="angle-down" />
          </Button>
        }
        // className="dropdown-btn"
        // align="end"
      >
        {renderDownloadFile()}
        {renderDownloadErrorFile()}
        {renderDelete()}
      </Dropdown>
    );
  };

  renderStatus = (history) => {
    if (history.status === "Done" || history.percentage === 100) {
      return history.contentTypes.map((value) => {
        const { removed = [] } = history;

        const isRemoved = removed.find(
          (removedItem) => removedItem === value.contentType
        );

        if (isRemoved) {
          return (
            <span key={Math.random()}>{value.contentType}(deleted) &nbsp;</span>
          );
        } else {
          return <span key={Math.random()}>{value.contentType} &nbsp;</span>;
        }
      });
    }

    if (history.error) {
      return (
        <Tip placement="top" text={history.error}>
          <TextInfo $textStyle="danger"> failed </TextInfo>
        </Tip>
      );
    }

    return (
      <TextInfo $textStyle="warning">
        {`${history.status}  ${history.percentage}%`}
      </TextInfo>
    );
  };

  render() {
    const { history } = this.props;

    const { user = {} as IUser } = history;
    const { details = {} } = user;

    const renderValue = (value) => {
      if (!value || value === 0) {
        return "-";
      }

      return value;
    };

    return (
      <tr>
        <td>
          <ImportTitle>
            <h6>{history.name || "-"}</h6>
            {this.renderStatus(history)}
          </ImportTitle>
        </td>
        <td>
          <span>{renderValue(history.success)}</span>
        </td>

        <td>
          <span>{renderValue(history.updated)}</span>
        </td>

        <td>
          <span>{renderValue(history.failed)}</span>
        </td>

        <td>{details?.fullName || "-"}</td>

        <td>
          <DateWrapper>{dayjs(history.date).format("lll")}</DateWrapper>
        </td>

        <td>
          <ImportHistoryActions>{this.renderAction()}</ImportHistoryActions>
        </td>
      </tr>
    );
  }
}

export default HistoryRow;
