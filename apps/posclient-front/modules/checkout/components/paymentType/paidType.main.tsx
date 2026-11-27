import usePaymentLabel from "../../hooks/usePaymentLabel"

const PaidType = ({
  type,
  amount,
  percent,
}: {
  type: string
  amount: number
  percent?: boolean
}) => {
  const { getLabel } = usePaymentLabel()
  return (
    <div className="flex w-full items-center justify-between py-1 text-sm">
      <div className="text-muted-foreground">{getLabel(type)}</div>
      <div className="font-semibold tabular-nums">
        {percent ? `${amount}%` : (amount || 0).toLocaleString()}
      </div>
    </div>
  )
}

export default PaidType
