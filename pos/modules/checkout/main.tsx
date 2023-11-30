import CheckoutConfig from "@/modules/auth/checkoutConfig"
import BuyAction from "@/modules/checkout/components/buyAction/buyAction.main"
import Cart from "@/modules/checkout/components/cart/cart.main"
import TotalAmount from "@/modules/checkout/components/totalAmount/totalAmount.main"
import Customer from "@/modules/customer"
import ChooseType from "@/modules/orders/components/chooseType/chooseType.main"
import OrderDetail from "@/modules/orders/OrderDetail"

const CheckoutMain = () => {
  return (
    <CheckoutConfig>
      <OrderDetail>
        <div className="p-4">
          <Customer />
        </div>
        <Cart />
        <div className="grid flex-none grid-cols-2 gap-2 p-4">
          <TotalAmount />
          <ChooseType />
          <BuyAction />
        </div>
      </OrderDetail>
    </CheckoutConfig>
  )
}

export default CheckoutMain
