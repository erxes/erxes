import { CARD_PAYMENT_STATUS, CARD_USER_STATUS } from "../../constants";
import {
  ClientPortalConfig,
  IClientPortalParticipant,
  IClientPortalUser,
  IClientPortalUserDoc,
} from "../../types";
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
  ScrollWrapper,
} from "@erxes/ui/src/styles/main";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";

import AvatarUpload from "@erxes/ui/src/components/AvatarUpload";
import Button from "@erxes/ui/src/components/Button";
import CollapseContent from "@erxes/ui/src/components/CollapseContent";
import ControlLabel from "@erxes/ui/src/components/form/Label";
import { Form } from "@erxes/ui/src/components/form";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import { __ } from "@erxes/ui/src/utils";

type Props = {
  currentUser: IUser;
  participant?: IClientPortalParticipant;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  clientPortalGetConfigs: ClientPortalConfig[];
};

type State = {
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  offeredAmount: number;
  hasVat: boolean;
};

class ClientPortalParticipantForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const clientPortalUser =
      props.clientPortalUser || ({} as IClientPortalUser);
    const userId = props.currentUser ? props.currentUser._id : "";

    const activeSections = {
      renderClientPortalUser: false,
      renderClientPortalCompany: false,
    };

    this.state = {
      status: this.props.participant?.status || "participating",
      paymentStatus: this.props.participant?.paymentStatus || "unpaid",
      paymentAmount: this.props.participant?.paymentAmount || 0,
      offeredAmount: this.props.participant?.offeredAmount || 0,
      hasVat: this.props.participant?.hasVat || false,
    };
  }

  generateDoc = (values: { _id: string } & IClientPortalParticipant) => {
    const { participant } = this.props;
    const finalValues = values;

    const doc: any = {
      id: participant?._id,
      ...this.state,
      paymentAmount: Number(this.state.paymentAmount),
      offeredAmount: Number(this.state.offeredAmount),
    };

    return doc;
  };

  renderSelectOptions() {
    return CARD_USER_STATUS.map((e) => {
      return (
        <option key={e.value} value={e.value}>
          {e.label}
        </option>
      );
    });
  }
  renderSelectPaymentOptions() {
    return CARD_PAYMENT_STATUS.map((e) => {
      return (
        <option key={e.value} value={e.value}>
          {e.label}
        </option>
      );
    });
  }

  onChangeStatus = (e) => {
    this.setState({
      status: e.target.value,
    });
  };
  onChangePaymentStatus = (e) => {
    this.setState({
      paymentStatus: e.target.value,
    });
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted, resetSubmit } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel>General Status</ControlLabel>
            <FormControl
              {...formProps}
              name="type"
              componentclass="select"
              defaultValue={this.props.participant?.status}
              required={true}
              onChange={this.onChangeStatus}
            >
              {this.renderSelectOptions()}
            </FormControl>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Payment Status</ControlLabel>
            <FormControl
              {...formProps}
              name="type"
              componentclass="select"
              defaultValue={this.props.participant?.paymentStatus}
              required={true}
              onChange={this.onChangePaymentStatus}
            >
              {this.renderSelectPaymentOptions()}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel required={true}>Payment Amount</ControlLabel>
            <FormControl
              {...formProps}
              defaultValue={this.props.participant?.paymentAmount}
              autoFocus={true}
              type="number"
              required={true}
              name="paymentAmount"
              onChange={(e: any) =>
                this.setState({ paymentAmount: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel required={true}>Offered Amount</ControlLabel>
            <FormControl
              {...formProps}
              defaultValue={this.props.participant?.offeredAmount}
              autoFocus={true}
              type="number"
              required={true}
              name="offeredAmount"
              onChange={(e: any) =>
                this.setState({ offeredAmount: e.target.value })
              }
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Has vat</ControlLabel>
            <FormControl
              {...formProps}
              name="hasVat"
              componentclass="checkbox"
              defaultChecked={this.props.participant?.hasVat || false}
              onChange={(e: any) => {
                this.setState({ hasVat: e.target.checked });
              }}
            />
          </FormGroup>
        </ScrollWrapper>
        <ModalFooter>
          <Button
            btnStyle="simple"
            uppercase={false}
            onClick={closeModal}
            icon="times-circle"
          >
            Close
          </Button>

          {renderButton({
            name: "clientPortalUser",
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.participant,
            resetSubmit,
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default ClientPortalParticipantForm;
