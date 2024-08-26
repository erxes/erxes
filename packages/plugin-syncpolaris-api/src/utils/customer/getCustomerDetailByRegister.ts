import { fetchPolaris } from "../utils";

interface IParams {
  register: string;
}

export const getCustomerDetailByRegister = async (
  subdomain: string,
  params: IParams
) => {
  if (!params.register) {
    throw new Error("Register required!");
  }

  let sendData = [params.register];

  return await fetchPolaris({
    subdomain,
    op: "13610335",
    data: sendData
  });
};
