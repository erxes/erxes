import { gql } from "@apollo/client";
import { ControlLabel } from "@erxes/ui/src/components/form";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Select from "react-select";
import React from "react";
import { withProps } from "@erxes/ui/src/utils";
import * as compose from "lodash.flowright";
import { graphql } from "@apollo/client/react/hoc";

import Spinner from "@erxes/ui/src/components/Spinner";
import { FormsQueryResponse } from "@erxes/ui-forms/src/forms/types";
import { queries } from "@erxes/ui-leads/src/graphql";
import { INTEGRATION_KINDS } from "@erxes/ui/src/constants/integrations";

type Props = {
  type: string;
  config: any;
  onChangeConfig?: (value) => void;
};

class Form extends React.Component<any, any, any> {
  onChangeForm = (_key, e) => {
    const formId = e ? e.value : "";

    const result = { formId };

    this.props.onChangeConfig(result);
  };

  render() {
    const { config, formsQuery } = this.props;

    if (formsQuery.loading) {
      return <Spinner />;
    }

    const { formId } = config || {};
    const forms = formsQuery.integrations || [];

    if (forms[0] && !formId) {
      this.props.onChangeConfig({ formId: forms[0].formId });
    }

    const options = forms.map((b) => ({ value: b.formId, label: b.name }));

    return (
      <>
        <FormGroup>
          <ControlLabel>Form</ControlLabel>
          <Select
            value={options.find((option) => option.value === formId)}
            options={options}
            isClearable={true}
            onChange={this.onChangeForm.bind(this, "formId")}
          />
        </FormGroup>
      </>
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, FormsQueryResponse, {}>(gql(queries.integrations), {
      name: "formsQuery",
      options: ({}) => {
        return {
          variables: {
            kind: INTEGRATION_KINDS.FORMS,
            perPage: 1000,
          },
        };
      },
    })
  )(Form)
);
