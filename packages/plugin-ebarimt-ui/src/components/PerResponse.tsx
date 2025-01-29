import React from 'react';

const getNum = (n) => {
  return (n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

let totalDiscount = 0;

const getRows = receipts => {
  let res = '';
  let ind = 0;

  for (const receipt of receipts) {
    for (const item of receipt.items) {
      ind += 1;
      const discount = item.unitPrice * item.qty - item.totalAmount;
      totalDiscount += discount;

      res = res.concat(`
      <tr class="inventory-info">
        <td colspan="4">
          ${ind}. ${item.name}
        </td>
      </tr>
      <tr class="right">
        <td class="right">${getNum(item.unitPrice)}</td>
        <td class="right">${item.qty}</td>
        <td class="right">${getNum(discount)}</td>
        <td class="right">${getNum(item.totalAmount)}</td>
      </tr>
      `);
    }
  }
  return res;
};

const customerInfo = (response) => {
  if (!(response.customerTin || response.customerName)) {
    return '';
  }
  return `
    <div>
      <br />
      <p><strong>Худалдан авагч:</strong></p>
      ${response.customerTin
      ? `<p>ТТД: ${response.customerTin}</p>`
      : ''}
      ${response.consumerNo
      ? `<p>РД: ${response.consumerNo}</p>`
      : ''}
      ${response.customerName
      ? `<p>Нэр: ${response.customerName} </p>`
      : ''}
    </div>
  `;
}

const customize = (response, field, defaultVal) => {
  if (response[field]) {
    return `
      <div>
        ${response[field]}
      </div>      
    `;
  }

  return defaultVal;
}

export default (response, counter?) => {
  totalDiscount = 0;
  return `
    <div class="receipt" id="${(response._id || '')}">
      ${(counter > 0 && '<div class="splitter"></div>') || ''}
      <div class="center">
        <img src="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/ebarimt.png">
      </div>
      <p class="center">
        ${response.companyName ? response.companyName : ''}
      </p>

      <p class="center">
        ${response.status !== 'SUCCESS' ? response.message : ''}
      </p>

      ${response.id
      ? `
        <div>
          <p>ТТД: ${response.merchantTin}</p>
          ${(response.id && `<p>ДДТД: ${response.id}</p>`) || ''}
          <p>Огноо: ${response.date}</p>
          ${(response.number && `<p>№: ${response.number}</p>`) || ''}
        </div>

        ${customerInfo(response)}
        ${customize(response, "headerText", "<br />")}

        <table class="tb" cellpadding="0" cellspacing="0">
          <thead>
            <tr class="text-center">
              <th>Нэгж үнэ</th>
              <th>Тоо</th>
              <th>Хөн</th>
              <th>Нийт үнэ</th>
            </tr>
          </thead>
          <tbody>
          ${getRows(response.receipts || [])}
          </tbody>
        </table>

        <div class="total">
          
          ${response.totalVAT > 0 && `<p><label>НӨАТ:</label> ${getNum(response.totalVAT)}</p>` || ''}
          ${response.totalCityTax > 0 && `<p><label>НХАТ:</label> ${getNum(response.totalCityTax)}</p>` || ''}
          <p><label>Бүгд үнэ:</label> ${getNum(response.totalAmount)}</p>
          ${totalDiscount > 0 && `<p><label>ХӨН:</label> ${getNum(totalDiscount)}</p>` || ''}
        </div>

        <div class="center barcode">
          <div class="lottery">
            ${response.lottery ? `Сугалаа: ${response.lottery}` : ''}
          </div>
          <div>
            ${response.qrData && `<canvas id="qrcode${response._id}"></canvas>` || ''}
          </div>

          ${customize(response, "footerText", "<p>Манайхаар үйлчлүүлсэн танд баярлалаа !!!</p>")}

          ${response.description && (`<div>
            ${response.description}
          </div>`)}
        </div>
      ` : `
        Буцаалт амжилттай.
      `
    }
    </div>
    <script>
      window.onbeforeunload = function () {
        return 'Уг цонхыг хаавал энэ баримтыг ахиж хэвлэх боломжгүй болохыг анхаарна уу';
      }

      ${response.qrData
      ? `
        // QRCODE
        var canvas = document.getElementById("qrcode${response._id || ''}");
        var ecl = qrcodegen.QrCode.Ecc.LOW;
        var text = '${response.qrData}';
        var segs = qrcodegen.QrSegment.makeSegments(text);
        // 1=min, 40=max, mask=7
        var qr = qrcodegen.QrCode.encodeSegments(segs, ecl, 1, 40, 2, false);
        // 4=Scale, 1=border
        qr.drawCanvas(4, 0, canvas);

        $("#qrcode${response._id || ''}").after('<img src="' + canvas.toDataURL() + '" />')
      `
      : ''
    }
    </script>
  `;
};
