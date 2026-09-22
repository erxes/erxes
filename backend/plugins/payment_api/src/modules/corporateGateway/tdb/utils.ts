/**
 * Validate TDB order status
 */
export const isTdbPaymentSuccessful = (status: string): boolean => {
  const successfulStatuses = ['FULLYPAID', 'PARTPAID', 'AUTHORIZED', 'PAID'];
  return successfulStatuses.includes(status.toUpperCase());
};

/**
 * Get human-readable status description
 */
export const getTdbStatusDescription = (status: string): string => {
  const statusMap: Record<string, string> = {
    PREPARING: 'Order is being prepared',
    EXPIRED: 'Order has expired',
    CANCELLED: 'Order was cancelled',
    REJECTED: 'Order was rejected',
    REFUSED: 'Payment was refused',
    CLOSED: 'Order is closed',
    VOIDED: 'Payment was voided',
    REFUNDED: 'Payment was refunded',
    DECLINED: 'Payment was declined',
    FULLYPAID: 'Payment completed successfully',
    PARTPAID: 'Partial payment completed',
    AUTHORIZED: 'Payment authorized',
    PAID: 'Payment completed',
  };
  return statusMap[status.toUpperCase()] || status;
};

/**
 * Build redirect URL with order parameters for HPP
 */
export const buildHppRedirectUrl = (
  hppUrl: string,
  orderId: number,
  password: string,
): string => {
  return `${hppUrl}/?id=${orderId}&password=${password}`;
};
