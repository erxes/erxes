import React from "react";
import ResetPasswordContainer from "../modules/user/containers/ResetPassword";
import { useRouter } from "next/router";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query as { token: string };

  return <ResetPasswordContainer token={token} />;
}
