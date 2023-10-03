import { BANK_CARD_TYPES } from "@/lib/constants"

import BankAmountUi from "./bank-amount-ui"

const Khaan = () => {
  return <BankAmountUi name="Хаан банк" type={BANK_CARD_TYPES.KHANBANK} />
}

export default Khaan
