import Cart from "./components/cart"

const Extended = () => {
  return (
    <div className="flex flex-auto items-stretch overflow-hidden px-5">
      <div
        className="relative flex h-full w-2/3 flex-col overflow-hidden py-4 pr-4
      "
      >
        <Cart />
      </div>
      <div className="flex w-1/3 flex-col border-l p-4 pr-0 relative"></div>
    </div>
  )
}

export default Extended
