import { PAYMENT_KINDS } from "~/modules/payment/constants";

export const paymentKind = (kind: string) => {
    const paymentKind = PAYMENT_KINDS[kind as keyof typeof PAYMENT_KINDS];
    if (!paymentKind) return null;
    return paymentKind;
};
