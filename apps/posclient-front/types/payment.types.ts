export interface PaymentType {
  _id: string
  type: string
  title: string
  icon: string
  config?: string
}

export interface IPaymentOption {
  _id: string
  name: string
  kind: string
  config: {
    [key: string]: string
  }
}
