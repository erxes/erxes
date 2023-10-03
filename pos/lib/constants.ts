export const ORDER_TYPES = {
  TAKE: "take",
  EAT: "eat",
  DELIVERY: "delivery",
  LOSS: "loss",
  SPEND: "spend",
  REJECT: "reject",
  ALL: ["take", "eat", "delivery", "loss", "spend", "reject"],
  SALES: ["take", "eat", "delivery"],
  OUT: ["loss", "spend", "reject"],
}

export const typeTextDef: any = {
  eat: "Зааланд",
  take: "Авч явах",
  delivery: "Хүргэлтээр",
  loss: "Хорогдол",
  spend: "Зарлагадсан",
  reject: "Гологдол",
}

export const ORDER_STATUSES = {
  NEW: "new",
  DOING: "doing",
  REDOING: "reDoing",
  DONE: "done",
  COMPLETE: "complete",
  PENDING: "pending",
  ALL: ["new", "doing", "done", "complete", "reDoing", "pending"],
  DISABLED: ["done", "complete"],
  ACTIVE: ["new", "doing", "reDoing", "pending"],
}

export const ORDER_ITEM_STATUSES = {
  NEW: "new",
  CONFIRM: "confirm",
  DONE: "done",

  ALL: ["new", "done", "confirm"],
}

// НӨАТ-н баримтын төрөл
export const BILL_TYPES = {
  CITIZEN: "1", // иргэнд өгөх баримт
  ENTITY: "3", // байгууллагад өгөх баримт
  INNER: "9", // дотоод буюу түр баримт
}

export const MOBILE = "mobileAmount"

const BANK_CARD_TYPES = {
  GOLOMT: "golomtCard",
  KHANBANK: "khaanCard",
  TDB: "TDBCard",
}

const ALL_BANK_CARD_TYPES = Object.values(BANK_CARD_TYPES)

const HARD_PAYMENT_TYPES = ["mobile", ...ALL_BANK_CARD_TYPES]

export { BANK_CARD_TYPES, ALL_BANK_CARD_TYPES, HARD_PAYMENT_TYPES }
