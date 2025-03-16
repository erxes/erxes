import * as React from "react";

import { TICKET_ADD } from "../../graphql/mutations";
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
    onCompleted() {
      return setIsSubmitted(true);
    },
    onError(error) {
      return console.log(error.message);
    },
  });

  const handleChange = (e: any) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const onSubmit = () => {
    const transformedFiles = files.map((file) => ({
      url: file.path, // Saving "path" as "url"
      name: file.preview, // Saving "preview" as "name"
    }));

    ticketAdd({
      variables: {
        name: formData.title,
        attachments: transformedFiles,
        stageId: ticketData.ticketStageId,
        ...formData,
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
      handleSubmit={onSubmit}
      handleChange={handleChange}
      handleButtonClick={onButtonClick}
      handleFiles={setFiles}
    />
  );
};

export default TicketSubmitContainer;
