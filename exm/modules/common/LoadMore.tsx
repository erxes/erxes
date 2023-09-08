import { getParam, setParams } from "../utils/router";

import Button from "./Button";
import { IRouterProps } from "../types";
import React from "react";

// import { withRouter } from "react-router-dom";

interface IProps extends IRouterProps {
  perPage?: number;
  all: number;
  paramName?: string;
  loading?: boolean;
}

function LoadMore({
  history = {},
  perPage = 20,
  all,
  paramName = "limit",
  loading,
}: IProps) {
  const loaded = parseInt(getParam(history, paramName), 10) || perPage;

  const load = () => {
    setParams(history, { limit: loaded + perPage });
  };

  return loaded < all ? (
    <Button
      block={true}
      btnStyle="link"
      onClick={load}
      icon="redo"
      uppercase={false}
    >
      {loading ? "Loading..." : "Load more"}
    </Button>
  ) : null;
}

export default LoadMore;
