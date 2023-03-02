import React from 'react';

export default (response, counter?) => {
  return `
    <div class="receipt" id="taxtype-${response.taxType}">
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
              ${response.billId && `<p>ДДТД: ${response.billId}</p>`}
              <p>Огноо: ${response.date}</p>
              ${(response.number && `<p>№: ${response.number}</p>`) || ''}
            </div>

            ${
              response.billType === '3'
                ? `
              <div>
                <br />
                <p><strong>Худалдан авагч:</strong></p>
                <p>ТТД: ${response.customerNo}</p>
                ${
                  response.customerName
                    ? `<p>Нэр: ${response.customerName} </p>`
                    : ''
                }
                <br />
              </div>
            `
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
              ${(response.stocks || []).map(
                (stock, index) => `
                  <tr class="inventory-info">
                    <td colspan="4">
                      ${index + 1}. ${stock.code} - ${stock.name}
                    </td>
                  </tr>
                  <tr>
                    <td>${stock.unitPrice}</td>
                    <td colspan="1">${stock.qty}</td>
                    <td>${stock.vat || 0}</td>
                    <td>${stock.totalAmount}</td>
                  </tr>
                `
              )}
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
                    <canvas id="qrcode${response.taxType}"></canvas>
                  `
                  : ''
              }

              <img id="barcode${response.taxType}" width="90%" />
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
        var canvas = document.getElementById("qrcode${response.taxType}");
        var ecl = qrcodegen.QrCode.Ecc.LOW;
        var text = '${response.qrData}';
        var segs = qrcodegen.QrSegment.makeSegments(text);
        // 1=min, 40=max, mask=7
        var qr = qrcodegen.QrCode.encodeSegments(segs, ecl, 1, 40, 2, false);
        // 4=Scale, 1=border
        qr.drawCanvas(4, 0, canvas);

        $("#qrcode${response.taxType}").after('<img src="' + canvas.toDataURL() + '" />')
      `
          : ''
      }

      $("#barcode${response.taxType}").JsBarcode('${response.billId}', {
        width: 1,
        height: 25,
        quite: 0,
        fontSize: 15,
        displayValue: false,
      });
    </script>
  `;
};
