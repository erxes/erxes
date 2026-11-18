const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const { test } = require("node:test")
const ts = require("typescript")

const filename = path.resolve(__dirname, "../pricingReason.ts")
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
})
const moduleContext = { exports: {} }
vm.runInNewContext(
  outputText,
  { exports: moduleContext.exports, require: () => ({}), Date },
  { filename }
)
const { formatWindow, formatReason, describeSchedule, nextBoundary } =
  moduleContext.exports

const now = new Date(2026, 10, 9, 20, 50)
const at = (h, m, day = 9) => new Date(2026, 10, day, h, m).toISOString()

test("windows read as their type, days and time", () => {
  assert.equal(
    formatWindow({ type: "weekly", weekDays: [0, 5, 1], startTime: "22:00", endTime: "02:00" }),
    "Да Ба Ня · 22:00–02:00"
  )
  assert.equal(
    formatWindow({ type: "yearly", fromMonthDay: "12-13", toMonthDay: "01-20", startTime: "00:00", endTime: "24:00" }),
    "12/13–1/20 · Бүтэн өдөр"
  )
  assert.equal(formatWindow({ type: "daily", startTime: "18:00", endTime: "21:00" }), "Өдөр бүр · 18:00–21:00")
})

test("a reason names the plan, window and moment", () => {
  const window = { type: "daily", startTime: "18:00", endTime: "21:00" }

  assert.equal(
    formatReason({ planName: "Happy hour", window, matchedMoment: "orderCreated" }),
    "Happy hour · Өдөр бүр · 18:00–21:00 · захиалга энэ цонхонд үүссэн"
  )
  assert.equal(formatReason({ planName: "Always on" }), "Always on")
})

test("schedule lines warn before a window closes", () => {
  // Objects from the module's own context: compare fields, not prototypes.
  const ending = describeSchedule({ planName: "HH", active: true, endsAt: at(21, 0) }, now)
  assert.equal(ending.tone, "ending")
  assert.equal(ending.text, "HH · 10 минутын дараа дуусна")

  const open = describeSchedule({ planName: "HH", active: true, endsAt: at(23, 0) }, now)
  assert.equal(open.tone, "active")
  assert.equal(open.text, "HH · 23:00 хүртэл")
})

test("a saved order matched by its creation keeps the discount", () => {
  assert.equal(
    describeSchedule({ planName: "HH", active: true, matchedMoment: "orderCreated", endsAt: at(21, 0) }, now, true).text,
    "HH · захиалга цонхонд үүссэн тул хүчинтэй"
  )
})

test("an inactive plan says when it ended and when it starts", () => {
  assert.equal(
    describeSchedule({ planName: "HH", active: false, endedAt: at(20, 0), startsAt: at(18, 0, 10) }, now).text,
    "HH · 20:00-д дууссан · 11/10 18:00-с эхэлнэ"
  )
})

test("the next boundary is the soonest open or close", () => {
  assert.equal(
    nextBoundary([{ endsAt: at(23, 0) }, { startsAt: at(21, 0) }, {}]),
    new Date(at(21, 0)).getTime()
  )
})

test("an open window does not help an order started outside it", () => {
  const status = describeSchedule(
    { planName: "HH", active: false, scheduleMoment: "orderCreated", endsAt: at(21, 0), startsAt: at(18, 0, 10) },
    now,
    true
  )
  assert.equal(status.tone, "idle")
  assert.equal(status.text, "HH · захиалга цонхны гадна үүссэн")
})
