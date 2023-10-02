import { TruckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const DeliveryInfo = () => {
  return (
    <Button className="font-medium" size="sm" variant="outline">
      <TruckIcon className="h-5 w-5 mr-1" strokeWidth={1.5} />
      Хүргэлтийн дэлгэрэнгүй
    </Button>
  )
}

export default DeliveryInfo
