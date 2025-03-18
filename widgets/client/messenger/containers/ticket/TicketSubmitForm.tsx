import * as React from "react";

import { CUSTOMER_ADD, TICKET_ADD } from "../../graphql/mutations";

import TicketSubmitForm from "../../components/ticket/TicketSubmitForm";
import { getTicketData } from "../../utils/util";
import { useMutation } from "@apollo/client";
import { useRouter } from "../../context/Router";

type Props = {
  loading: boolean;
};

const TicketSubmitContainer = (props: Props) => {
  const { setRoute } = useRouter();
  const [files, setFiles] = React.useState<
    {
      path: string | null | undefined;
      preview: string;
    }[]
  >([]);
  const ticketData = getTicketData();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [ticketNumber, setTicketNumber] = React.useState("");
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    ticketType: "",
    title: "",
    description: "",
  });

  const [ticketAdd, { loading }] = useMutation(TICKET_ADD, {
    onCompleted(data) {
      const { ticketsAdd } = data || {};

      return (
        <>
          {setTicketNumber(ticketsAdd.number || "")}
          {setIsSubmitted(true)}
        </>
      );
    },
    onError(error) {
      return alert(error.message);
    },
  });

  const [customerAdd, { loading: customerAddLoading }] = useMutation(
    CUSTOMER_ADD,
    {
      fetchPolicy: "no-cache",
      onCompleted(data) {
        const { customersAdd } = data || {};
        const customerId = customersAdd._id || "";

        const transformedFiles = files.map((file) => ({
          url: file.path, // Saving "path" as "url"
          name: file.preview, // Saving "preview" as "name"
          type: "image",
        }));

        return ticketAdd({
          variables: {
            name: formData.title,
            description: formData.description,
            attachments: transformedFiles,
            stageId: ticketData.ticketStageId,
            type: formData.ticketType,
            customerIds: [customerId],
          },
        });
      },
      onError(error) {
        return alert(error.message);
      },
    }
  );

  const handleChange = (e: any) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const onSubmit = (e: any) => {
    e.preventDefault();

    return customerAdd({
      variables: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        primaryEmail: formData.email,
        primaryPhone: formData.phone,
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
      ticketNumber={ticketNumber}
      handleSubmit={onSubmit}
      handleChange={handleChange}
      handleButtonClick={onButtonClick}
      handleFiles={setFiles}
      customerAddLoading={customerAddLoading}
    />
  );
};

export default TicketSubmitContainer;
