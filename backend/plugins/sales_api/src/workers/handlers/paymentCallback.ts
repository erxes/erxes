export const handlePaymentCallback = async (subdomain: string, data: any) => {
  console.log('======= SALES WORKER: Payment callback received =======');
  console.log('Subdomain:', subdomain);
  console.log('Invoice ID:', data._id);
  console.log('PosToken:', data.posToken);
  console.log('Amount:', data.amount);
  console.log('ContentType:', data.contentType);
  console.log('ContentTypeId:', data.contentTypeId);
  console.log('Full data:', JSON.stringify(data, null, 2));
  console.log('========================================================');
};