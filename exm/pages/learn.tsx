import { IUser } from "../modules/auth/types";
import LearnContainer from "../modules/exmFeed/containers/Learn";
import React from "react";

export default function Learn({ currentUser }) {
  return <LearnContainer currentUser={currentUser || ({} as IUser)} />;
}
