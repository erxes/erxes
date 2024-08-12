import { IButtonMutateProps, IQueryParams } from "@erxes/ui/src/types";
import { ICustomer, IFieldsVisibility } from "../types";
import { PropertyConsumer, PropertyProvider } from "../propertyContext";
import React, { useState } from "react";
import { mutations, queries } from "../graphql";

import { AppConsumer } from "@erxes/ui/src/appContext";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import CustomerForm from "../components/CustomerForm";
import { IUser } from "@erxes/ui/src/auth/types";
import client from "@erxes/ui/src/apolloClient";
import { mutations as conformityMutations } from "@erxes/ui-sales/src/conformity/graphql";
import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";

type Props = {
  type?: string;
  customer: ICustomer;
  closeModal: () => void;
  getAssociatedCustomer?: (newCustomer: ICustomer) => void;
  queryParams: IQueryParams;
  customerVisibilityInDetail: IFieldsVisibility;
};

type FinalProps = {} & Props;
const CustomerFormContainer = (props: FinalProps) => {
  const [redirectType, setRedirectType] = useState<string | undefined>(
    undefined
  );
  const navigate = useNavigate();

  const changeRedirectType = (redirectType: string) => {
    setRedirectType(redirectType);
  };

  const { closeModal, type, getAssociatedCustomer } = props;

  const renderButton = ({
    passedName,
    values,
    isSubmitted,
    object,
    resetSubmit,
  }: IButtonMutateProps) => {
    const afterSave = (data) => {
      if (values.relationData && Object.keys(values.relationData).length > 0) {
        const { relationData } = values;

        for (const key in relationData) {
          if (relationData.hasOwnProperty(key)) {
            client.mutate({
              mutation: gql(conformityMutations.conformityEdit),
              variables: {
                mainType: "customer",
                mainTypeId: data.customersAdd._id,
                relType: key,
                relTypeIds: relationData[key],
              },
            });
          }
        }
      }

      closeModal();

      if (redirectType === "detail") {
        return navigate(`/contacts/details/${data.customersAdd._id}`);
      }

      const currentLocation = `${window.location.pathname}${window.location.search}`;

      if (getAssociatedCustomer) {
        getAssociatedCustomer(data.customersAdd);
      }

      if (redirectType === "new") {
        navigate(`/contacts`);
        navigate(`${currentLocation}#showCustomerModal=true`, {
          replace: true,
        });
      }
    };

    values.state = type || "customer";

    return (
      <ButtonMutate
        mutation={object ? mutations.customersEdit : mutations.customersAdd}
        variables={values}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        disableLoading={redirectType ? true : false}
        disabled={isSubmitted}
        type="submit"
        icon="check-circle"
        resetSubmit={resetSubmit}
        uppercase={false}
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a ${passedName}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    changeRedirectType,
    renderButton,
  };

  return (
    <AppConsumer>
      {({ currentUser }) => (
        <PropertyProvider>
          <PropertyConsumer>
            {({ customerVisibility }) => {
              return (
                <CustomerForm
                  {...updatedProps}
                  currentUser={currentUser || ({} as IUser)}
                  autoCompletionQuery={queries.customers}
                  fieldsVisibility={customerVisibility}
                />
              );
            }}
          </PropertyConsumer>
        </PropertyProvider>
      )}
    </AppConsumer>
  );
};

const getRefetchQueries = () => {
  return ["customersMain", "customers", "customerCounts"];
};

export default CustomerFormContainer;
