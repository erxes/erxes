import Button from "./Button";
import React from "react";
import { router } from "../utils/core";
import { useLocation, useNavigate } from "react-router-dom";

interface IProps {
  perPage?: number;
  all: number;
  paramName?: string;
  loading?: boolean;
}

function LoadMore({
  perPage = 20,
  all,
  paramName = "limit",
  loading,
}: IProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const loaded = parseInt(router.getParam(location, paramName), 10) || perPage;

  const load = () => {
    router.setParams(navigate, location, { limit: loaded + perPage });
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
