const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const { test } = require("node:test")
const ts = require("typescript")

function loadSource(relativePath) {
  const filename = path.resolve(__dirname, relativePath)
  const moduleObject = { exports: {} }
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText
  vm.runInNewContext(
    source,
    {
      module: moduleObject,
      exports: moduleObject.exports,
      require: (name) =>
        name.startsWith("@/") || name.startsWith(".") ? {} : require(name),
    },
    { filename }
  )
  return moduleObject.exports
}

const {
  changeSummary,
  fieldChanges,
  isEmptyValue,
  itemChanges,
  logTarget,
  objectEntries,
  valueText,
} = loadSource("../orderLogUtils.ts")

const item = {
  _id: "item",
  productId: "product",
  productName: "Product",
  count: 3,
  unitPrice: 100,
}

const fields = (log) => fieldChanges(log).map((change) => change.field)

test("empty values are recursive and read as a dash", () => {
  assert.equal(isEmptyValue(null), true)
  assert.equal(isEmptyValue(""), true)
  assert.equal(isEmptyValue([]), true)
  assert.equal(isEmptyValue({ a: null, b: { c: "" } }), true)
  assert.equal(isEmptyValue(0), false)
  assert.equal(isEmptyValue({ a: 1 }), false)
  assert.equal(valueText({ a: null }), "—")
  assert.equal(valueText(true), "Тийм")
  assert.equal(valueText(false), "Үгүй")
  assert.equal(valueText(300), "300")
})

test("object values list only their filled fields", () => {
  assert.equal(
    JSON.stringify(objectEntries({ a: 1, b: null, c: "" })),
    JSON.stringify([["a", 1]])
  )
  assert.equal(objectEntries("text"), null)
})

test("create events summarise the total and the cart without unchanged fields", () => {
  const log = {
    _id: "log",
    orderId: "order",
    orderNumber: "001",
    action: "create",
    changes: [
      { field: "status", oldValue: null, newValue: "new" },
      { field: "totalAmount", oldValue: null, newValue: 300 },
      { field: "description", oldValue: null, newValue: "" },
      { field: "items", oldValue: null, newValue: [item] },
    ],
  }
  assert.equal(logTarget(log), "001")
  assert.deepEqual(fields(log), ["status", "totalAmount"])
  assert.equal(changeSummary(log), "Дүн 300 · Бараа 0 → 1")
})

test("cancel events expand the order snapshot but keep its items apart", () => {
  const log = {
    _id: "log",
    orderId: "order",
    action: "cancel",
    changes: [
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
  }
  const changes = fieldChanges(log)
  assert.deepEqual(
    changes.map((change) => change.field),
    ["number", "totalAmount", "customerId"]
  )
  assert.equal(changes[2].oldValue, "customer")
  assert.equal(changeSummary(log), "Дүн 300 → — · Бараа 1 → 0")
})

test("cart changes count items and keep item-specific removals", () => {
  const log = {
    _id: "log",
    action: "update",
    changes: [
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
    ],
  }
  const { actions, beforeCount, afterCount } = itemChanges(log)
  assert.equal(logTarget(log), "Сагс")
  assert.deepEqual(fields(log), [])
  assert.equal(beforeCount, 1)
  assert.equal(afterCount, 0)
  assert.equal(actions.length, 1)
  assert.equal(actions[0].action, "removed")
})

test("deleted covers show their dates and payment details", () => {
  const log = {
    _id: "log",
    coverId: "cover-deleted",
    source: "cover",
    action: "delete",
    changes: [
      {
        field: "cover",
        oldValue: {
          beginDate: "2026-10-28T00:00:00Z",
          endDate: "2026-10-29T00:00:00Z",
          details: [
            {
              paidType: "TDBCard",
              paidSummary: [{ amount: 1200 }],
              terminalResults: [{ response: "Bank settlement receipt" }],
            },
          ],
        },
        newValue: null,
      },
    ],
  }
  const changes = fieldChanges(log)
  assert.equal(logTarget(log), "Хаалт")
  assert.deepEqual(
    changes.map((change) => change.field),
    ["beginDate", "endDate", "details"]
  )
  const details = valueText(changes[2].oldValue)
  assert.match(details, /TDBCard/)
  assert.match(details, /1200/)
  assert.match(details, /Bank settlement receipt/)
})
