import dynamic from "next/dynamic"

const DeliveryInputs = dynamic(() => import("./"), {
  loading: () => <div className="h-8 w-full col-span-2" />,
})

const ShowDeliveryInfo = () => {
  return <DeliveryInputs />
}

export default ShowDeliveryInfo
