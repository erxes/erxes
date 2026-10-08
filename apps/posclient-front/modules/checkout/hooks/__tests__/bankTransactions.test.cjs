const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const { test } = require("node:test")
const ts = require("typescript")

const banks = [
  [
    "useTDB",
    "useTDBTransaction",
    "TDBTransaction",
    { ecrResult: { RespCode: "00" } },
  ],
  [
    "useCapitron",
    "useCapitronTransaction",
    "capitronTransaction",
    { ecrResult: { RespCode: "00" } },
  ],
  [
    "useGolomt",
    "useGolomtTransaction",
    "sendTransaction",
    { PosResult: JSON.stringify({ responseCode: "00" }) },
  ],
]

function loadTransaction(file, hook, method, response, options) {
  const filename = path.resolve(__dirname, `../${file}.tsx`)
  const moduleObject = { exports: {} }
  const toasts = []
  const dependencies = {
    "@/lib/constants": { BANK_CARD_TYPES: {} },
    "@/lib/utils": { getLocal: () => "", convertToBase64: () => "request" },
    "@/components/ui/use-toast": { toast: (value) => toasts.push(value) },
    "./usePaymentType": { default: () => ({ config: {} }), __esModule: true },
  }
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
      require: (name) => dependencies[name],
      fetch: async () => ({ json: async () => response }),
    },
    { filename }
  )
  return { transaction: moduleObject.exports[hook](options)[method], toasts }
}

for (const [file, hook, method, response] of banks) {
  test(`${file} waits for payment persistence before reporting success`, async () => {
    let finishPayment
    let paymentStarted
    const started = new Promise((resolve) => {
      paymentStarted = resolve
    })
    const pending = new Promise((resolve) => {
      finishPayment = resolve
    })
    const { transaction, toasts } = loadTransaction(
      file,
      hook,
      method,
      response,
      {
        onCompleted: () => {
          paymentStarted()
          return pending
        },
        onError: () => assert.fail("Unexpected payment error"),
      }
    )
    let settled = false
    const result = transaction({ _id: "order", amount: 100 }).then(() => {
      settled = true
    })
    await started
    await Promise.resolve()
    assert.equal(settled, false)
    assert.equal(toasts.length, 0)
    finishPayment()
    await result
    assert.equal(toasts.length, 1)
    assert.equal(toasts[0].description, "Transaction was successful")
  })

  test(`${file} reports payment persistence failure without a success toast`, async () => {
    let errors = 0
    const { transaction, toasts } = loadTransaction(
      file,
      hook,
      method,
      response,
      {
        onCompleted: async () => {
          throw new Error("Payment save failed")
        },
        onError: () => {
          errors += 1
        },
      }
    )
    await transaction({ _id: "order", amount: 100 })
    assert.equal(errors, 1)
    assert.equal(toasts.length, 1)
    assert.equal(toasts[0].variant, "destructive")
    assert.equal(toasts[0].description, "Payment save failed")
  })

  test(`${file} does not save declined terminal transactions`, async () => {
    const declined =
      file === "useGolomt"
        ? {
            PosResult: JSON.stringify({
              responseCode: "05",
              responseDesc: "Declined",
            }),
          }
        : { ecrResult: { RespCode: "05" } }
    let errors = 0
    const { transaction, toasts } = loadTransaction(
      file,
      hook,
      method,
      declined,
      {
        onCompleted: () => assert.fail("Declined payment must not be saved"),
        onError: () => {
          errors += 1
        },
      }
    )
    await transaction({ _id: "order", amount: 100 })
    assert.equal(errors, 1)
    assert.equal(toasts.length, 1)
    assert.equal(toasts[0].variant, "destructive")
  })
}
