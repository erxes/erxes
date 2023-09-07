import Home from "../components/Home";
import { IUser } from "../../auth/types";
import React from "react";

type Props = {
  queryParams: any;
  currentUser: IUser;
};

export default function HomeContainer(props: Props) {
  return <Home {...props} />;
}
