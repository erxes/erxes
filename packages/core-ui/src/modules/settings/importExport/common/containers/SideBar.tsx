import { gql, useQuery } from "@apollo/client";

import React from "react";
import Sidebar from "../components/SideBar";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries } from "../graphql";
import { router } from "modules/common/utils";
import { useNavigate, Location } from "react-router-dom";

type Props = {
  currentType: string;
  location: Location;
  mainType: string;
};

const SideBarContainer: React.FC<Props> = ({
  currentType,
  location,
  mainType,
}) => {
  const navigate = useNavigate();

  const { loading, data } = useQuery(gql(queries.historyGetTypes), {
    variables: {
      type: mainType,
    },
  });

  if (loading) {
    return <Spinner />;
  }

  const services = data?.historyGetTypes || [];

  if (!router.getParam(location, "type") && services.length !== 0) {
    router.setParams(
      navigate,
      location,
      { type: services[0].contentType },
      true
    );
  }

  return <Sidebar currentType={currentType} services={services} />;
};

export default SideBarContainer;
