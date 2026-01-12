import { useWatch } from "react-hook-form"

const ReturnOdd = ({
  totalAmount,
  control,
}: {
  totalAmount: number
  control: any
}) => {
  const results = useWatch({ control })
  //   const formValues = getValues()

  const total = Object.values(results).reduce(
    (acc: number, curr: any) =>
      isNaN(Number(curr)) ? acc : acc + Number(curr),
    0
  )
  return (
    <div className="font-semibold">
      Зөрүү: {(totalAmount - total).toLocaleString()}₮
    </div>
  )
}

export default ReturnOdd
