const CartHeader = () => {
  return (
    <div className="mb-1 flex rounded border-transparent bg-primary px-3.5 py-3 text-sm leading-4 text-white">
      <div className="flex w-5/12">
        <small className="w-1/12">#</small>
        <small className="w-11/12">Барааны нэр</small>
      </div>
      <small className="w-3/12">Тоо ширхэг</small>
      <small className="flex w-4/12">
        <span className="w-6/12">Бар код</span>
        <span className="w-5/12">Үнэ</span>
      </small>
    </div>
  )
}

export default CartHeader
