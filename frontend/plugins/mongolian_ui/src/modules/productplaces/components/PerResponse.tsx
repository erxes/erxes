// Define types for the data structures
interface Product {
  code?: string;
  name?: string;
}

interface Stock {
  product?: Product;
  unitPrice: string | number;
  quantity: string | number;
  amount: string | number;
}

interface Branch {
  code?: string;
  title?: string;
}

interface Department {
  code?: string;
  title?: string;
}

interface ResponseData {
  date: string;
  number?: string;
  branch?: Branch;
  department?: Department;
  customerNo?: string;
  customerName?: string;
  pDatas?: Stock[];
  amount: string | number;
}

const getRows = (stocks: Stock[]): string => {
  let res = '';
  let ind = 0;

  for (const stock of stocks) {
    ind += 1;
    res += `
      <tr>
        <td>
          ${ind}. ${stock.product?.code || ''} - ${stock.product?.name || ''}
        </td>
        <td>${stock.unitPrice}</td>
        <td colspan="1">${stock.quantity}</td>
        <td>${stock.amount}</td>
      </tr>
    `;
  }

  return res;
};

const PerResponse = (response: ResponseData, counter?: number): string => {
  const showSplitter = Boolean(counter && counter > 0);
  const showNumber = Boolean(response.number);
  const showCustomer =
    Boolean(response.customerNo) || Boolean(response.customerName);

  // ✅ Extracted statements (Sonar fix)
  const customerNoBlock = response.customerNo
    ? `<p>ТТД: ${response.customerNo}</p>`
    : '';

  const customerNameBlock = response.customerName
    ? `<p>Нэр: ${response.customerName}</p>`
    : '';

  const customerBlock = showCustomer
    ? `
      <div>
        <p><strong>Худалдан авагч:</strong></p>
        ${customerNoBlock}
        ${customerNameBlock}
      </div>
    `
    : '';

  return `
    <div class="receipt">
      ${showSplitter ? '<div class="splitter"></div>' : ''}
      <div>
        <p>Огноо: ${response.date}</p>
        ${showNumber ? `<p>№: ${response.number}</p>` : ''}
        <p>
          Branch:
          ${response.branch?.code || ''} - ${response.branch?.title || ''}
        </p>
        <p>
          Department:
          ${response.department?.code || ''} - ${
            response.department?.title || ''
          }
        </p>
      </div>
      ${customerBlock}
      <table class="tb" cellpadding="0" cellspacing="0">
        <thead>
          <tr class="text-center">
            <th>Бараа</th>
            <th>Үнэ</th>
            <th>Тоо</th>
            <th>Дүн</th>
          </tr>
        </thead>
        <tbody>
          ${getRows(response.pDatas ?? [])}
        </tbody>
      </table>
      <div class="total">
        <p><label>Бүгд үнэ:</label> ${response.amount}</p>
      </div>
    </div>
    <script>
      window.onbeforeunload = function () {
        return 'Уг цонхыг хаавал энэ баримтыг ахиж хэвлэх боломжгүй болохыг анхаарна уу';
      }
    </script>
  `;
};

export default PerResponse;