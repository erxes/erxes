import * as compose from "lodash.flowright";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import React from "react";

import {
  IntegrationTypesInstagram,
  RemoveAccountMutationResponse
} from "@erxes/ui-inbox/src/settings/integrations/types";
import { Alert, getEnv, withProps } from "@erxes/ui/src/utils";
import { mutations as inboxMutations } from "@erxes/ui-inbox/src/settings/integrations/graphql";
import { IFormProps } from "@erxes/ui/src/types";
import Info from "@erxes/ui/src/components/Info";
import Spinner from "@erxes/ui/src/components/Spinner";
import Accounts from "../components/Accounts";
import { queries } from "../graphql/index";
import { AccountsQueryResponse } from "../types";

type Props = {
  kind: IntegrationTypesInstagram;
  onSelect: (accountId?: string, account?: any) => void;
  onRemove: (accountId: string) => void;
  formProps?: IFormProps;
  renderForm?: () => JSX.Element;
  selectedAccountId?: string;
};

type FinalProps = {
  getAccountsQuery: AccountsQueryResponse;
} & Props &
  RemoveAccountMutationResponse;

class AccountContainer extends React.Component<FinalProps, {}> {
  popupWindow(url, title, win, w, h) {
    const y = win.top.outerHeight / 2 + win.top.screenY - h / 2;
    const x = win.top.outerWidth / 2 + win.top.screenX - w / 2;

    return win.open(
      url,
      title,
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`
    );
  }

  onAdd = () => {
    const { kind } = this.props;
    const { REACT_APP_API_URL } = getEnv();

    this.popupWindow(
      `${REACT_APP_API_URL}/pl:instagram/iglogin?kind=${kind}`,
      "Integration",
      window,
      660,
      750
    );
  };

  remove = (accountId: string) => {
    const { removeAccount, onRemove, kind } = this.props;

    removeAccount({ variables: { _id: accountId, kind } })
      .then(() => {
        Alert.success("You successfully removed an account");
        onRemove(accountId);
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  render() {
    const {
      kind,
      renderForm,
      getAccountsQuery,
      onSelect,
      formProps,
      selectedAccountId
    } = this.props;

    if (getAccountsQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (getAccountsQuery.error) {
      return <Info>{getAccountsQuery.error.message}</Info>;
    }

    const accounts = getAccountsQuery.instagramGetAccounts || [];

    const updatedProps = {
      kind,
      onAdd: this.onAdd,
      removeAccount: this.remove,
      onSelect,
      accounts,
      formProps,
      renderForm,
      selectedAccountId
    };

    return <Accounts {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      Props,
      RemoveAccountMutationResponse,
      { _id: string; kind?: string }
    >(gql(inboxMutations.removeAccount), {
      name: "removeAccount",
      options: {
        refetchQueries: ["instagramGetAccounts"]
      }
    }),
    graphql<Props, AccountsQueryResponse>(gql(queries.instagramGetAccounts), {
      name: "getAccountsQuery",
      options: ({ kind }) => ({
        variables: { kind }
      })
    })
  )(AccountContainer)
);
