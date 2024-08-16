import * as React from 'react';
import Ticket from '../components/Ticket';
import { useRouter } from '../context/Router';

const TicketContainer = () => {
  const { setRoute } = useRouter();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const onSubmit = () => {
    setIsSubmitted(true);
  };

  const onButtonClick = () => {
    setRoute('home');
  };

  return (
    <Ticket
      isSubmitted={isSubmitted}
      handleSubmit={onSubmit}
      handleButtonClick={onButtonClick}
    />
  );
};

export default TicketContainer;
