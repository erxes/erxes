import { fetchPolaris, getConfig } from "../utils";

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
  const polarisConfig = await getConfig(subdomain, 'POLARIS', {});

  return await fetchPolaris({
    subdomain,
    op: "13610335",
    data: sendData,
    polarisConfig
  });
};
