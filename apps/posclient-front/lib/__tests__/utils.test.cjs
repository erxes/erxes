const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const { test } = require("node:test")
const ts = require("typescript")

const filename = path.resolve(__dirname, "../utils.ts")
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
})
const moduleContext = { exports: {} }
vm.runInNewContext(
  outputText,
  { exports: moduleContext.exports, require: () => ({}) },
  { filename }
)
const { getItemInputs } = moduleContext.exports

const item = {
  _id: "shW0PPq6B-4EE4lihfMtP",
  productId: "YHgm-Vdliv5sh8c744doJ",
  count: 1,
  unitPrice: 47920,
  discountAmount: null,
  discountInfos: null,
  conditionCode: null,
}

test("legacy order items accept null, omitted, and empty discount metadata", () => {
  for (const discountInfos of [null, undefined, []]) {
    for (const includeHandDiscounts of [true, false]) {
      const [input] = getItemInputs([{ ...item, discountInfos }], {
        includeHandDiscounts,
      })
      assert.equal(input.unitPrice, 47920)
      assert.equal(input.count, 1)
      assert.equal(input.discountInfos, undefined)
      assert.equal(input.conditionCode, undefined)
      assert.equal(item.discountInfos, null)
    }
  }
})

test("legacy discount amounts restore the original unit price without metadata", () => {
  const [input] = getItemInputs([
    { ...item, count: 2, unitPrice: 80, discountAmount: 40 },
  ])
  assert.equal(input.unitPrice, 100)
  assert.equal(input.discountInfos, undefined)
})

test("automatic and manual discounts restore the price and retain manual metadata", () => {
  const manual = { type: "hand", amount: 10 }
  const discountedItem = {
    ...item,
    unitPrice: 80,
    discountInfos: [{ type: "pricing", amount: 10 }, manual],
  }
  const [input] = getItemInputs([discountedItem])
  assert.equal(input.unitPrice, 100)
  assert.equal(input.discountInfos.length, 1)
  assert.equal(input.discountInfos[0], manual)

  const [withoutManual] = getItemInputs([discountedItem], {
    includeHandDiscounts: false,
  })
  assert.equal(withoutManual.unitPrice, 100)
  assert.equal(withoutManual.discountInfos, undefined)
})
