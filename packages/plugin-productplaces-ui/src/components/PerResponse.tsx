import React from 'react';

const getRows = stocks => {
  let res = '';
  let ind = 0;
  for (const stock of stocks) {
    ind += 1;
    res = res.concat(`
    <tr>
      <td>
        ${ind}. ${stock.product?.code} - ${stock.product?.name}
      </td>
      <td>${stock.unitPrice}</td>
      <td colspan="1">${stock.quantity}</td>
      <td>${stock.amount}</td>
    </tr>
    `);
  }
  return res;
};

export default (response, counter?) => {
  return `
    <div class="receipt" id="">
      ${(counter > 0 && '<div class="splitter"></div>') || ''}

      ${`
        <div>
          <p>Огноо: ${response.date}</p>
          ${(response.number && `<p>№: ${response.number}</p>`) || ''}
          <p>
            Branch:
            ${response.branch?.code || ''} - ${response.branch?.title || ''}
          </p>
          <p>
            Department:
            ${response.department?.code || ''} - ${response.department?.title ||
        ''}
          </p>
        </div>

        ${
          response.customerNo || response.customerName
            ? `<div>
            <p><strong>Худалдан авагч:</strong></p>
            ${response.customerNo ? `<p>ТТД: ${response.customerNo}</p>` : ''}
            ${
              response.customerName
                ? `<p>Нэр: ${response.customerName} </p>`
                : ''
            }
          </div>`
            : ''
        }

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
          ${getRows(response.pDatas || [])}
          </tbody>
        </table>

        <div class="total">
          <p><label>Бүгд үнэ:</label> ${response.amount}</p>
        </div>
      `}
    </div>
    <script>
      window.onbeforeunload = function () {
        return 'Уг цонхыг хаавал энэ баримтыг ахиж хэвлэх боломжгүй болохыг анхаарна уу';
      }
    </script>
  `;
};
