import * as React from "react";
import Booking from "../components/Booking";
import { AppConsumer } from "./AppContext";
import { IBookingData } from "../types";

type Props = {
  goToIntro: () => void;
  booking: IBookingData | null;
  goToCategory: (categoryId: string) => void;
  goToProduct: (productId: string) => void;
  invoiceResponse?: any;
  invoiceType?: string;
  lastMessageId?: string;
  onCancelOrder: (customerId: string, messageId: string) => void;
};

function BookingContainer(props: Props) {
  const extendedProps = {
    ...props
  };

  return <Booking {...extendedProps} />;
}

const WithContext = () => {
  return (
    <AppConsumer>
      {({
        goToIntro,
        getBooking,
        goToCategory,
        goToProduct,
        cancelOrder,
        invoiceResponse,
        invoiceType,
        lastMessageId
      }) => {
        const booking = getBooking();
        return (
          <BookingContainer
            goToIntro={goToIntro}
            booking={booking}
            goToCategory={goToCategory}
            goToProduct={goToProduct}
            onCancelOrder={cancelOrder}
            invoiceResponse={invoiceResponse}
            invoiceType={invoiceType}
            lastMessageId={lastMessageId}
          />
        );
      }}
    </AppConsumer>
  );
};

export default WithContext;
