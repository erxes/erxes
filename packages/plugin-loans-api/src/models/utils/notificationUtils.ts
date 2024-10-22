import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import {
  sendCoreMessage,
  sendMessageBroker,
  sendSms
} from "../../messageBroker";
import { IContractDocument } from "../definitions/contracts";
import { IInvoiceDocument } from "../definitions/invoices";

export async function sendNotification(
  subdomain: string,
  contract: IContractDocument,
  invoice: IInvoiceDocument
) {
  const isEnabledClientPortal = await isEnabled("clientportal");

  const isSms = await isEnabled("sms");

  const isEmail = true;

  const customer = await sendMessageBroker(
    {
      subdomain,
      action: "customers.findOne",
      data: { _id: contract.customerId },
      isRPC: true
    },
    "core"
  );

  if (isEnabledClientPortal) {
    sendMessageBroker(
      {
        subdomain,
        data: {
          receivers: contract.customerId,
          title: `Мэдэгдэл`,
          content: `${contract.number} гэрээний эргэн төлөлт ${invoice.total} тул та хугцаандаа эргэн төлөлт өө хийнэ үү `,
          notifType: "system",
          link: ""
        },
        action: "sendNotification"
      },
      "clientportal"
    );
  }

  if (isSms && customer.phoneNumber) {
    sendSms(
      subdomain,
      "messagePro",
      customer.phoneNumber,
      `${contract.number} гэрээний эргэн төлөлт ${invoice.total} тул та хугцаандаа эргэн төлөлт өө хийнэ үү`
    );
  }

  if (isEmail && customer.email) {
    await sendCoreMessage({
      subdomain,
      action: "sendEmail",
      data: {
        toEmails: [customer.email],
        fromEmail: "info@erxes.io",
        title: `Мэдэгдэл`,
        customHtmlData: generateTemplate(invoice, contract)
      }
    });
  }
}

const generateTemplate = (
  { total, payment, loss, storedInterest }: IInvoiceDocument,
  { interestRate, leaseAmount }: IContractDocument
) => {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Нэхэмжлэх</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 800px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          header {
            text-align: center;
          }
          .invoice-details {
            margin-top: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th,
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .total {
            margin-top: 20px;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header><h2>Нэхэмжлэх</h2></header>
          <table>
            <thead>
              <tr>
                <th>Үнэдсэн зээл</th>
                <th>Хүү</th>
                <th>
                  Нэмэгдүүлсэн хүү (Нэмэгдүүлсэн хүү гэдэг нь хугацаа хэтэрсэн
                  торгууль гэж ойлгох хэрэгтэй )
                </th>
                <th>Сарын хамгийн бага төлөлт</th>
                <th>/10%/ +Хүү нэмэгдэнэ</th>
                <th>Нэхэмжлэхийн нийт дүн</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${leaseAmount}</td>
                <td>${interestRate}</td>
                <td>${loss}</td>
                <td>${payment}</td>
                <td>${storedInterest}</td>
                <td>${total}</td>
              </tr>
            </tbody>
          </table>
          <div class="total"><p>Total: ${total}</p></div>
        </div>
      </body>
    </html>
  `;
};
