const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const { test } = require("node:test")
const ts = require("typescript")
const React = require("react")
const { renderToStaticMarkup } = require("react-dom/server")

function loadSource(relativePath, dependencies = {}) {
  const filename = path.resolve(__dirname, relativePath)
  const moduleObject = { exports: {} }
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText
  vm.runInNewContext(
    source,
    {
      module: moduleObject,
      exports: moduleObject.exports,
      require: (name) =>
        dependencies[name] || (name.startsWith("@/") ? {} : require(name)),
    },
    { filename }
  )
  return moduleObject.exports
}

const audit = loadSource("../../graphql/orderAudit.ts")
const { AuditChanges } = loadSource("../OrderAuditPage.tsx", {
  "../graphql/orderAudit": audit,
})
const item = {
  _id: "item",
  productId: "product",
  productName: "Product",
  count: 3,
  unitPrice: 100,
}
const render = (changes, action = "update") =>
  renderToStaticMarkup(
    React.createElement(AuditChanges, {
      log: { _id: "log", orderNumber: "001", action, changes },
    })
  )

test("create events have compact summaries and collapsed order/items details", () => {
  const html = render(
    [
      { field: "status", oldValue: null, newValue: "new" },
      { field: "totalAmount", oldValue: null, newValue: 300 },
      { field: "items", oldValue: null, newValue: [item] },
    ],
    "create"
  )
  const summaries = [...html.matchAll(/<summary[^>]*>(.*?)<\/summary>/g)].map(
    (match) => match[1]
  )
  assert.equal(summaries.length, 2)
  assert.match(summaries[0], /number: 001/)
  assert.match(summaries[0], /totalAmount:/)
  assert.match(summaries[0], /itemsCount: 0 → 1/)
  assert.doesNotMatch(summaries[0], /status/)
  assert.match(summaries[1], /Барааны өөрчлөлт/)
  assert.match(summaries[1], /\[0\] \/ \[1\]/)
  assert.doesNotMatch(html, /<details[^>]*\bopen[= >]/)
  assert.match(html, /status/)
})

test("cancel events expand full order fields while keeping items in the second row", () => {
  const html = render(
    [
      {
        field: "order",
        oldValue: {
          number: "001",
          totalAmount: 300,
          customerId: "customer",
          items: [item],
        },
        newValue: null,
      },
      { field: "items", oldValue: [item], newValue: [] },
    ],
    "cancel"
  )
  assert.match(html, /customerId/)
  assert.match(html, /customer/)
  assert.match(html, /itemsCount: 1 → 0/)
  assert.ok(
    html.indexOf("Захиалгын өөрчлөлт") < html.indexOf("Барааны өөрчлөлт")
  )
  assert.doesNotMatch(html, /&quot;items&quot;/)
})

test("cart changes use array lengths and retain item-specific removal details", () => {
  const html = render([
    { field: "items", oldValue: [item], newValue: [] },
    {
      field: "itemActions",
      newValue: [
        {
          itemId: "item",
          productId: "product",
          action: "removed",
          beforeCount: 3,
          afterCount: 0,
        },
      ],
    },
  ])
  assert.doesNotMatch(html, /Захиалгын өөрчлөлт/)
  assert.match(html, /\[1\] \/ \[0\]/)
  assert.match(html, /Устгасан/)
  assert.match(html, /3 → 0/)
})
