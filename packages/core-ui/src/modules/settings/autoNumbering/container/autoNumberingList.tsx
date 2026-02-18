import { gql } from "@apollo/client";
import * as compose from "lodash.flowright";
import { Alert, withProps, confirm } from "@erxes/ui/src/utils";
import React from "react";
import { graphql } from "@apollo/client/react/hoc";
import AutoNumberingList from "../components/autoNumberingList";
import Spinner from "@erxes/ui/src/components/Spinner";
import { QueryResponse } from "@erxes/ui/src/types";
import { Link } from "react-router-dom";




// Queries & Mutations


const AUTO_NUMBERINGS = gql`
 query autoNumberings {
   autoNumberings {
     _id
     module
     pattern
     fractionalPart
     lastNumber
     createdAt
   }
 }
`;


const AUTO_NUMBERING_REMOVE = gql`
 mutation autoNumberingRemove($_id: String!) {
   autoNumberingRemove(_id: $_id)
 }
`;


// Types


export interface IAutoNumbering {
 _id: string;
 module: string;
 pattern: string;
 fractionalPart: number;
 createdAt: Date;
}


export type AutoNumberingsQueryResponse = {
 autoNumberings: IAutoNumbering[];
} & QueryResponse;


export type RemoveMutationResponse = {
 removeMutation: (params: { variables: { _id: string } }) => Promise<string>;
};




// Container Component


type Props = {};


type FinalProps = {
 autoNumberingsQuery: AutoNumberingsQueryResponse;
} & Props &
 RemoveMutationResponse;


export const AutoNumberingListContainer = (props: FinalProps) => {
 const { autoNumberingsQuery, removeMutation } = props;
   console.log("Query state:", {
   loading: autoNumberingsQuery?.loading,
   error: autoNumberingsQuery?.error,
   data: autoNumberingsQuery?.autoNumberings
 });
 // Debug logging
 console.log("AutoNumbering query result:", {
   loading: autoNumberingsQuery.loading,
   error: autoNumberingsQuery.error,
   autoNumberings: autoNumberingsQuery.autoNumberings,
 });


 // Loading state
 if (autoNumberingsQuery.loading) {
   return <Spinner />;
 }


 // Error state
 if (autoNumberingsQuery.error) {
   const err = autoNumberingsQuery.error as unknown;
   const errMsg =
     typeof err === "string"
       ? err
       : err && typeof err === "object" && "message" in err
       ? (err as { message: string }).message
       : "Unknown error";


   console.error("Error loading auto numberings:", errMsg);


   return (
     <div style={{ padding: 20, color: "red" }}>
       Failed to load Auto Numberings: {errMsg}
     </div>
   );
 }


 // Delete handler
 const removeAutoNumbering = (id: string) => {
   confirm().then(() => {
     removeMutation({
       variables: { _id: id },
     })
       .then(() => {
         autoNumberingsQuery.refetch();
         Alert.success("Successfully deleted Auto Numbering");
       })
       .catch((error: unknown) => {
         const errMsg =
           typeof error === "string"
             ? error
             : error && typeof error === "object" && "message" in error
             ? (error as { message: string }).message
             : "Unknown error";


         Alert.error(errMsg);
       });
   });
 };


 // Empty state
 if (!autoNumberingsQuery.autoNumberings?.length) {
   return (
     <div style={{ padding: 20 }}>
       No auto-numberings found.{" "}
       <Link to="/settings/auto-numbering/new">Create one</Link>
     </div>
   );
 }


 // Normal state
 const updatedProps = {
   ...props,
   loading: autoNumberingsQuery.loading,
   modules: autoNumberingsQuery.autoNumberings || [],
   removeAutoNumbering,
 };


 return <AutoNumberingList {...updatedProps} />;
};




// Export with HOCs


export default withProps<Props>(
 compose(
   graphql<Props>(AUTO_NUMBERINGS, {
     name: "autoNumberingsQuery",
   }),
   graphql<Props>(AUTO_NUMBERING_REMOVE, {
     name: "removeMutation",
   })
 )(AutoNumberingListContainer)
);


