import AuthLayout from "../modules/layout/components/AuthLayout";
import HomeContainer from "../modules/exmFeed/containers/Home";
import React from "react";
import SignIn from "../modules/auth/containers/SignIn";

export default function Home({ currentUser }) {
  if (!currentUser) {
    return <AuthLayout content={<SignIn />} />;
  }

  return <HomeContainer queryParams={{}} currentUser={currentUser} />;
}
