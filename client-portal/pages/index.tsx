import React from "react";
import CategoriesContainer from "../modules/knowledgeBase/containers/CategoryList";
import { useRouter } from "next/router";
import { gql, useMutation } from '@apollo/client';

const socialPayLogin = gql`
  mutation socialPayLogin($token: String!) {
    socialPayLogin(token: $token) {
      token
    }
  }
`;

export default function Home() {
  const router = useRouter();
  const token = router.query.token;


  return <CategoriesContainer />;
}


// import React, { useEffect } from "react";

// const Receive = () => {
//   const router = useRouter();
//   const code = router.query.code;

//   useEffect(() => {
//     router.push(`/profile/rent-access/personal-info-ask?code=${code}`);
//   });

//   return <p>Redirecting...</p>;
// };

// export default Receive;
