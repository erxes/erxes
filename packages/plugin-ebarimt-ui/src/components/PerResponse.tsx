import React from 'react';

const getRows = stocks => {
  let res = '';
  let ind = 0;
  for (const stock of stocks) {
    ind += 1;
    res = res.concat(`
    <tr class="inventory-info">
      <td colspan="4">
        ${ind}. ${stock.code} - ${stock.name}
      </td>
    </tr>
    <tr>
      <td>${stock.unitPrice}</td>
      <td colspan="1">${stock.qty}</td>
      <td>${stock.vat}</td>
      <td>${stock.totalAmount}</td>
    </tr>
    `);
  }
  return res;
};

export default (response, counter?) => {
  return `
    <div class="receipt" id="taxtype-${response.taxType}${(response._id || '')
    .toString()
    .replace('.', '')}">
      ${(counter > 0 && '<div class="splitter"></div>') || ''}
      <div class="center">
        <img src="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/ebarimt.png">
      </div>
      <p class="center">
        ${response.companyName ? response.companyName : ''}
      </p>

      <p class="center">
        ${response.success === 'false' ? response.message : ''}
      </p>

      ${
        response.billId
          ? `
            <div>
              <p>ТТД: ${response.registerNo}</p>
              ${(response.billId && `<p>ДДТД: ${response.billId}</p>`) || ''}
              <p>Огноо: ${response.date}</p>
              ${(response.number && `<p>№: ${response.number}</p>`) || ''}
            </div>

            ${
              response.customerNo || response.customerName
                ? `<div>
                <br />
                <p><strong>Худалдан авагч:</strong></p>
                ${
                  response.customerNo
                    ? `<p>ТТД: ${response.customerNo}</p>`
                    : ''
                }
                ${
                  response.customerName
                    ? `<p>Нэр: ${response.customerName} </p>`
                    : ''
                }
                <br />
              </div>`
                : ''
            }

            <table class="tb" cellpadding="0" cellspacing="0">
              <thead>
                <tr class="text-center">
                  <th>Нэгж үнэ</th>
                  <th>Тоо</th>
                  <th>НӨАТ</th>
                  <th>Нийт үнэ</th>
                </tr>
              </thead>
              <tbody>
              ${getRows(response.stocks || [])}
              </tbody>
            </table>

            <div class="total">
              <p><label>НӨАТ:</label> ${response.vat}</p>
              <p><label>НХАТ:</label> ${response.cityTax}</p>
              <p><label>Бүгд үнэ:</label> ${response.amount}</p>
            </div>

            <div class="center barcode">
              <div class="lottery">
                ${response.lottery ? `Сугалаа: ${response.lottery}` : ''}
              </div>

              ${
                response.qrData
                  ? `
                    <canvas id="qrcode${response.taxType}${(response._id || '')
                      .toString()
                      .replace('.', '')}"></canvas>
                  `
                  : ''
              }

              <p>Манайхаар үйлчлүүлсэн танд баярлалаа !!!</p>
            </div>
          `
          : `
            Буцаалт амжилттай.
          `
      }
    </div>
    <script>
      window.onbeforeunload = function () {
        return 'Уг цонхыг хаавал энэ баримтыг ахиж хэвлэх боломжгүй болохыг анхаарна уу';
      }

      ${
        response.qrData
          ? `
        // QRCODE
        var canvas = document.getElementById("qrcode${response.taxType}${(
              response._id || ''
            )
              .toString()
              .replace('.', '')}");
        var ecl = qrcodegen.QrCode.Ecc.LOW;
        var text = '${response.qrData}';
        var segs = qrcodegen.QrSegment.makeSegments(text);
        // 1=min, 40=max, mask=7
        var qr = qrcodegen.QrCode.encodeSegments(segs, ecl, 1, 40, 2, false);
        // 4=Scale, 1=border
        qr.drawCanvas(4, 0, canvas);

        $("#qrcode${response.taxType}${(response._id || '')
              .toString()
              .replace(
                '.',
                ''
              )}").after('<img src="' + canvas.toDataURL() + '" />')
      `
          : ''
      }
    </script>
  `;
};
