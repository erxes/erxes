import usePaymentLabel from "../../hooks/usePaymentLabel"

const PaidType = ({ type, amount }: { type: string; amount: number }) => {
  const { getLabel } = usePaymentLabel()
  return (
    <div className="mb-2 flex items-center justify-between w-full max-w-[250px] text-sm">
      <div className="text-slate-500">{getLabel(type)}</div>
      <div className="font-bold">{(amount || 0).toLocaleString()}</div>
    </div>
  )
}

export default PaidType
