import gql from "graphql-tag";
import { mutations } from "../graphql";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";

type Props = {
  config: any;
};

function VerifyContainer(props: Props) {
  const router = useRouter();
  const { code } = router.query;
  const { config } = props;
  const [googleAuth] = useMutation(gql(mutations.googleLogin));

  if (!code) {
    return <p>Invalid code</p>;
  }

  googleAuth({
    variables: {
      code,
      clientPortalId: config._id,
    },
  })
    .then((result) => {
      if (result?.data?.clientPortalGoogleAuthentication === "loggedin") {
        window.location.href = "/";
      }
    })
    .catch((e) => {
      console.error("error: ", e.message);
    });

  return <p />;
}

export default VerifyContainer;
