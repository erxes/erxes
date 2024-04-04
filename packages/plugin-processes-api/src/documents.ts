import * as moment from 'moment';
import { generateModels } from './connectionResolver';
import {
  sendContactsMessage,
  sendCoreMessage,
  sendProductsMessage
} from './messageBroker';

const toMoney = value => {
  if (!value) {
    return '-';
  }
  return new Intl.NumberFormat().format(value);
};

const productsInfo = async (
  subdomain,
  productData,
  isPrice = false,
  isSeries = false
) => {
  const productIds = productData.map(p => p.productId);

  const products = await sendProductsMessage({
    subdomain,
    action: 'find',
    data: { query: { _id: { $in: productIds } }, limit: productIds.length },
    isRPC: true,
    defaultValue: []
  });

  const productById = {};
  for (const product of products) {
    productById[product._id] = product;
  }

  let sumCount = 0;

  let content = `<table class='products-data'>
    <thead>
      <th>№</th>
      <th>Code</th>
      <th>Name</th>
      <th style="text-align: right;">Quantity</th>
      <th>Uom</th>
    </thead><tbody>
  `;

  let counter = 0;
  for (const pdata of productData) {
    counter += 1;
    const product = productById[pdata.productId];
    sumCount += pdata.quantity;

    content += `<tr>
      <td>${counter}</td>
      <td>${product.code}</td>
      <td>${product.name}</td>
      <td style="text-align: right;">${pdata.quantity}</td>
      <td>${pdata.uom}</td>
    </tr>`;
  }

  content += `<tr>
    <td></td>
    <td></td>
    <td>Нийт:</td>
    <td style="text-align: right;">${toMoney(sumCount)}</td>
    <td></td>
  </tr></tbody></table>`;

  return content;
};

export default {
  types: [
    {
      type: 'processes',
      label: 'Processes',
      subTypes: ['income', 'move', 'outcome', 'job']
    }
  ],

  editorAttributes: async ({}) => {
    return [
      { value: 'startAt', name: 'Start At' },
      { value: 'endAt', name: 'End At' },
      { value: 'modifiedAt', name: 'Modified At' },
      { value: 'createdBy', name: 'Created By' },
      { value: 'description', name: 'Description' },
      { value: 'appendix', name: 'Appendix' },
      { value: 'seriesText', name: 'Series Text' },
      { value: 'company', name: 'Company' },
      { value: 'customer', name: 'Customer' },
      { value: 'seriesBarcode', name: 'Series Barcode' },
      { value: 'seriesQrcode', name: 'Series QR code' },
      { value: 'spendBranch', name: 'Spend Branch' },
      { value: 'spendDepartment', name: 'Spend Department' },
      { value: 'receiptBranch', name: 'Receipt Branch' },
      { value: 'receiptDepartment', name: 'Receipt Department' },
      { value: 'assignedUser', name: 'Assigned User' },

      { value: 'needProducts', name: 'Need products' },
      { value: 'resultProducts', name: 'Result products' },
      { value: 'spendProducts', name: 'Spend products' },
      { value: 'receiptProducts', name: 'Receipt products' },
      { value: 'spendProductsSeries', name: 'Spend products with series' },
      { value: 'receiptProductsPrice', name: 'Receipt products with price' }
    ];
  },

  replaceContent: async ({ subdomain, data: { performId, content } }) => {
    const models = await generateModels(subdomain);

    const results: string[] = [];

    const perform = await models.Performs.getPerform(performId);

    if (
      content.includes('{{ seriesBarcode }}') ||
      content.includes('{{ seriesQrcode }}')
    ) {
      results.push(
        '::heads::<script src="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/jquery.js"></script>'
      );
    }

    if (content.includes('{{ seriesBarcode }}')) {
      results.push(
        '::heads::<script src="https://nmgplugins.s3.us-west-2.amazonaws.com/JsBarcode.all.min.js"></script>'
      );
    }

    if (content.includes('{{ seriesQrcode }}')) {
      results.push(
        '::heads::<script src="https://nmgplugins.s3.us-west-2.amazonaws.com/ebarimt/qrcodegen.js"></script>'
      );
    }

    let replacedContent = content;

    replacedContent = replacedContent.replace(
      '{{ startAt }}',
      moment(perform.startAt).format('YYYY-MM-DD HH:mm')
    );

    replacedContent = replacedContent.replace(
      '{{ endAt }}',
      moment(perform.endAt).format('YYYY-MM-DD HH:mm')
    );

    replacedContent = replacedContent.replace(
      '{{ modifiedAt }}',
      moment(perform.modifiedAt).format('YYYY-MM-DD HH:mm')
    );

    replacedContent = replacedContent.replace(
      '{{ createdAt }}',
      moment(perform.createdAt).format('YYYY-MM-DD HH:mm')
    );

    replacedContent = replacedContent.replace(
      '{{ description }}',
      perform.description || ''
    );

    replacedContent = replacedContent.replace(
      '{{ appendix }}',
      perform.appendix || ''
    );

    replacedContent = replacedContent.replace(
      '{{ seriesText }}',
      perform.series || ''
    );

    if (replacedContent.includes('{{ spendBranch }}')) {
      let spendBranch: any;
      if (perform.inBranchId) {
        spendBranch = await sendCoreMessage({
          subdomain,
          action: 'branches.findOne',
          data: { _id: perform.inBranchId },
          isRPC: true
        });
      }

      if (spendBranch) {
        replacedContent = replacedContent.replace(
          /{{ spendBranch }}/g,
          `${spendBranch.code} - ${spendBranch.title}`
        );
      } else {
        replacedContent = replacedContent.replace(/{{ spendBranch }}/g, '');
      }
    }

    if (replacedContent.includes('{{ spendDepartment }}')) {
      let spendDepartment: any;
      if (perform.inDepartmentId) {
        spendDepartment = await sendCoreMessage({
          subdomain,
          action: 'departments.findOne',
          data: { _id: perform.inDepartmentId },
          isRPC: true
        });
      }

      if (spendDepartment) {
        replacedContent = replacedContent.replace(
          /{{ spendDepartment }}/g,
          `${spendDepartment.code} - ${spendDepartment.title}`
        );
      } else {
        replacedContent = replacedContent.replace(/{{ spendDepartment }}/g, '');
      }
    }

    if (replacedContent.includes('{{ receiptBranch }}')) {
      let receiptBranch: any;
      if (perform.outBranchId) {
        receiptBranch = await sendCoreMessage({
          subdomain,
          action: 'branches.findOne',
          data: { _id: perform.outBranchId },
          isRPC: true
        });
      }

      if (receiptBranch) {
        replacedContent = replacedContent.replace(
          /{{ receiptBranch }}/g,
          `${receiptBranch.code} - ${receiptBranch.title}`
        );
      } else {
        replacedContent = replacedContent.replace(/{{ receiptBranch }}/g, '');
      }
    }

    if (replacedContent.includes('{{ receiptDepartment }}')) {
      let receiptDepartment: any;
      if (perform.outDepartmentId) {
        receiptDepartment = await sendCoreMessage({
          subdomain,
          action: 'departments.findOne',
          data: { _id: perform.outDepartmentId },
          isRPC: true
        });
      }

      if (receiptDepartment) {
        replacedContent = replacedContent.replace(
          /{{ receiptDepartment }}/g,
          `${receiptDepartment.code} - ${receiptDepartment.title}`
        );
      } else {
        replacedContent = replacedContent.replace(
          /{{ receiptDepartment }}/g,
          ''
        );
      }
    }

    if (replacedContent.includes('{{ assignedUser }}')) {
      let assignedUser: any;
      if (perform.assignedUserIds.length) {
        assignedUser = await sendCoreMessage({
          subdomain,
          action: 'users.findOne',
          data: { _id: perform.assignedUserIds[0] },
          isRPC: true
        });
      }

      if (assignedUser) {
        replacedContent = replacedContent.replace(
          /{{ assignedUser }}/g,
          `${assignedUser.code} - ${assignedUser.title}`
        );
      } else {
        replacedContent = replacedContent.replace(/{{ assignedUser }}/g, '');
      }
    }

    if (replacedContent.includes(`{{ company }}`)) {
      if (perform.companyId) {
        const company = await sendContactsMessage({
          subdomain,
          action: 'companies.findOne',
          data: {
            _id: perform.companyId
          },
          isRPC: true,
          defaultValue: {}
        });

        replacedContent = replacedContent.replace(
          /{{ company }}/g,
          company?.primaryName || ''
        );
      } else {
        replacedContent = replacedContent.replace(/{{ company }}/g, '');
      }
    }

    if (replacedContent.includes(`{{ customer }}`)) {
      if (perform.customerId) {
        const customer = await sendContactsMessage({
          subdomain,
          action: 'customers.findOne',
          data: {
            _id: perform.customerId
          },
          isRPC: true,
          defaultValue: {}
        });

        replacedContent = replacedContent.replace(
          /{{ customer }}/g,
          customer?.firstName || ''
        );
      } else {
        replacedContent = replacedContent.replace(/{{ customer }}/g, '');
      }
    }

    if (content.includes('{{ seriesBarcode }}')) {
      let barcode = (perform as any).series || '';
      const divid = barcode.replace(/\s+/g, '');

      replacedContent = replacedContent.replace(
        '{{ seriesBarcode }}',
        `
          <p style="text-align: center;">
          <svg id="barcode${divid}"></svg>
          </p>
          <script>
            JsBarcode("#barcode${divid}", "${barcode}", {
              width: 1.5,
              height: 40,
              displayValue: false
            });
          </script>
        `
      );
    }

    if (content.includes('{{ seriesQrcode }}')) {
      let qrcode = (perform as any).series || '';

      replacedContent = replacedContent.replace(
        '{{ seriesQrcode }}',
        `
          <p style="text-align: center;">
            <canvas id="qrcode${qrcode}"></canvas>
          </p>
          <script>
          var canvas = document.getElementById("qrcode${qrcode}");
          var ecl = qrcodegen.QrCode.Ecc.LOW;
          var text = '${qrcode}';
          var segs = qrcodegen.QrSegment.makeSegments(text);
          // 1=min, 40=max, mask=7
          var qr = qrcodegen.QrCode.encodeSegments(segs, ecl, 1, 40, 2, false);
          // 4=Scale, 1=border
          qr.drawCanvas(4, 0, canvas);
            // $("#qrcode${qrcode}").after('<img src="' + canvas.toDataURL() + '" />')
          </script>
        `
      );
    }

    replacedContent = replacedContent.replace(
      '{{ needProducts }}',
      await productsInfo(subdomain, perform.needProducts)
    );
    replacedContent = replacedContent.replace(
      '{{ resultProducts }}',
      await productsInfo(subdomain, perform.resultProducts)
    );
    replacedContent = replacedContent.replace(
      '{{ spendProducts }}',
      await productsInfo(subdomain, perform.inProducts)
    );
    replacedContent = replacedContent.replace(
      '{{ receiptProducts }}',
      await productsInfo(subdomain, perform.outProducts)
    );
    replacedContent = replacedContent.replace(
      '{{ spendProductsSeries }}',
      await productsInfo(subdomain, perform.inProducts, false, true)
    );
    replacedContent = replacedContent.replace(
      '{{ receiptProductsPrice }}',
      await productsInfo(subdomain, perform.outProducts, true, false)
    );

    results.push(replacedContent);
    results.push(`::styles::
      .products-data tr td {
        border-bottom: 1px dashed #444;
      }
    `);

    return results;
  }
};
