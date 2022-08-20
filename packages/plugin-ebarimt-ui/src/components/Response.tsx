import React from 'react';

export default (response, error?) => {
  return `
    <!DOCTYPE html>
    <html>

    <head>
      <meta charset="utf-8">
      <link rel="stylesheet" href="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/print.css" media="print">
      <script src="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/jquery.js"></script>
      <script src="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/qrcodegen.js"></script>
      <script src="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/jsbarcode.js"></script>
    </head>

    <body>
      <div class="receipt">

        <div class="center">
          <img src="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/ebarimt.png">
        </div>
        <p class="center">
          ${response.companyName ? response.companyName : ''}
        </p>

        <p class="center">
          ${error ? `error: ${error}` : ''}
          ${response.success === 'false' ? response.message : ''}
        </p>

        ${
          response.billId
            ? `
          <div>
            <p>ТТД: ${response.registerNo}</p>
            ${response.billId && `<p>ДДТД: ${response.billId}</p>`}
            <p>Огноо: ${response.date}</p>

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
                <td>${stock.vat}</td>
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
              <canvas id="qrcode"></canvas>
            `
                : ''
            }

            <img id="barcode" width="90%" />
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
          var canvas = document.getElementById("qrcode");
          var ecl = qrcodegen.QrCode.Ecc.LOW;
          var text = '${response.qrData}';
          var segs = qrcodegen.QrSegment.makeSegments(text);
          // 1=min, 40=max, mask=7
          var qr = qrcodegen.QrCode.encodeSegments(segs, ecl, 1, 40, 2, false);
          // 4=Scale, 1=border
          qr.drawCanvas(4, 0, canvas);

          $("#qrcode").after('<img src="' + canvas.toDataURL() + '" />')
        `
            : ''
        }

        $("#barcode").JsBarcode('${response.billId}', {
          width: 1,
          height: 25,
          quite: 0,
          fontSize: 15,
          displayValue: false,
        });
      </script>
      <style type="text/css">
        /*receipt*/
        html {
          color: #000;
          font-size: 13px;
          font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
        }

        body {
          margin: 0;
        }

        .receipt {
          width: 270px;
        }

        table {
          width: 100%;
          max-width: 100%;

        }

        table tr:last-child td {
          border-bottom: 1px dashed #444;

        }

        table thead th {
          padding: 5px;
          border-top: 1px dashed #444;
          border-bottom: 1px dashed #444;
          text-align: left;
        }

        table tbody td {
          padding: 5px;
          text-align: left;
        }

        .center {
          text-align: center;
        }

        .lottery {
          font-weight: bold;
          margin-top: 20px;
        }

        .barcode img {
          margin: 10px auto;
        }

        .barcode p {
          font-weight: bold;
          font-size: 12px;
        }

        p {
          margin-bottom: 10px;
          margin-top: 5px;
        }

        .text-right {
          text-align: right;
        }

        .inventory-info {
          font-weight: bold;
        }

        .total {
          margin-top: 30px;
        }

        .total label {
          font-weight: bold;
        }

        canvas {
          display: none;
        }
      </style>
      <script>
        setTimeout(
          window.print(),
          100
        )
      </script>
    </body>

    </html>
  `;
};
