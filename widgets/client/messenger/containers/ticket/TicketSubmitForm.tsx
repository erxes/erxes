import * as React from "react";

import { CUSTOMER_EDIT, TICKET_ADD } from "../../graphql/mutations";
import { gql, useMutation, useQuery } from "@apollo/client";

import { ICustomer } from "../../../types";
import TicketSubmitForm from "../../components/ticket/TicketSubmitForm";
import { connection } from "../../connection";
import { customerDetail } from "../../graphql/queries";
import { getTicketData } from "../../utils/util";
import { readFile } from "../../../utils";
import { useRouter } from "../../context/Router";

interface FileWithUrl extends File {
  url?: string;
}

type Props = {
  loading: boolean;
};

const TicketSubmitContainer = (props: Props) => {
  const { setRoute } = useRouter();

  const [files, setFiles] = React.useState<FileWithUrl[]>([]);
  const ticketData = getTicketData();
  const { customerId } = connection.data;
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [ticketNumber, setTicketNumber] = React.useState("");
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    phone: 0,
    email: "",
    ticketType: "",
    title: "",
    description: "",
  });

  const {
    data: customer,
    loading: customerLoading,
    refetch: customerRefetch,
  } = useQuery(gql(customerDetail), {
    variables: { customerId },
    skip: !customerId,
  });

  React.useEffect(() => {
    if (customer && customer.widgetsTicketCustomerDetail) {
      const { emails, firstName, lastName, phones } =
        customer.widgetsTicketCustomerDetail || ({} as ICustomer);
      setFormData((prev) => ({
        ...prev,
        firstName,
        lastName,
        phone: Number(phones?.[0].replace(/\D/g, "")) || 0,
        email: emails?.[0] || "",
      }));
    }
  }, [customer]);

  const [ticketAdd, { loading }] = useMutation(TICKET_ADD, {
    onCompleted(data) {
      const { widgetTicketCreated } = data || {};

      return (
        <>
          {setTicketNumber(widgetTicketCreated.number || "")}
          {setIsSubmitted(true)}
        </>
      );
    },
    onError(error) {
      return alert(error.message);
    },
  });

  const [customerEdit] = useMutation(CUSTOMER_EDIT, {
    fetchPolicy: "no-cache",
    onCompleted: async () => {
      const transformedFiles = files.map((file) => ({
        url: readFile(file.url || ""),
        name: file.name,
        type: "image",
      }));

      await ticketAdd({
        variables: {
          name: formData.title,
          description: formData.description,
          attachments: transformedFiles,
          stageId: ticketData.ticketStageId,
          type: formData.ticketType,
          customerIds: [customerId],
        },
      });

      customerRefetch();
    },
    onError(error) {
      return alert(error.message);
    },
  });

  const handleChange = (e: any) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const onSubmit = (e: any) => {
    e.preventDefault();

    return customerEdit({
      variables: {
        customerId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        emails: [formData.email],
        phones: [formData.phone],
      },
    });
  };

  const onButtonClick = () => {
    setRoute("home");
  };
  return (
    <TicketSubmitForm
      isSubmitted={isSubmitted}
      loading={loading}
      formData={formData}
      ticketNumber={ticketNumber}
      handleSubmit={onSubmit}
      handleChange={handleChange}
      handleButtonClick={onButtonClick}
      handleFiles={setFiles}
      customerLoading={customerId ? customerLoading : false}
    />
  );
};

export default TicketSubmitContainer;
