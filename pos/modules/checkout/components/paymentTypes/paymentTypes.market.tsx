import useConfig from "@/modules/auth/hooks/useConfig"

import PaymentType from "../paymentType/paymentType.market"

const PaymentTypes = () => {
  const { loading } = useConfig("payment")

  return <>{loading ? <div className="h-12" /> : <PaymentType />}</>
}

export default PaymentTypes
