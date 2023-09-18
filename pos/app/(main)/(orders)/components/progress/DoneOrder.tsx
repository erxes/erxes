import { mutations } from "@/modules/orders/graphql"
import { useMutation } from "@apollo/client"
import { ArrowDownIcon, XIcon } from "lucide-react"

import { IOrder } from "@/types/order.types"
import { ORDER_STATUSES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const DoneOrder = ({ number, status, _id }: IOrder) => {
  return (
    <Button
      className="mx-1 bg-green-500 hover:bg-green-500 px-0 space-x-1"
      size="sm"
      Component={"div"}
    >
      <DoneOrderAction _id={_id} />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="font-extrabold">{number?.split("_")[1]}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{number}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DoneOrderAction _id={_id} actionType="complete" />
    </Button>
  )
}

const DoneOrderAction = ({
  _id,
  actionType,
}: {
  actionType?: string
  _id?: string
}) => {
  const Icon = actionType === "complete" ? XIcon : ArrowDownIcon
  const [changeStatus, { loading }] = useMutation(mutations.orderChangeStatus)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={"sm"}
            className="hover:bg-green-400 hover:text-white px-2"
            iconOnly
            loading={loading}
            onClick={() =>
              changeStatus({
                variables: {
                  _id,
                  status:
                    actionType === "complete"
                      ? ORDER_STATUSES.COMPLETE
                      : ORDER_STATUSES.REDOING,
                },
              })
            }
          >
            <Icon className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {actionType === "complete"
              ? "Захиалгыг бүрэн дуусгах"
              : "Захиалгыг буцаах"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default DoneOrder
