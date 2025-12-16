import fetch from "node-fetch";
import redis from "../redis";
import { encryptedPassword } from "./encryptPassword";

export const getAuthHeaders = async (args: {
  name: string;
  organizationName: string;
  ivKey: string;
  sessionKey: string;
  clientId: string;
  configPassword: string;
  registerId: string;
  golomtCode?: string;
  apiUrl: string;
}) => {
  const { name, ivKey, clientId, configPassword, sessionKey, apiUrl } = args;

  const accessToken = await redis.get(
    `golomtbank_token_${clientId}:${sessionKey}`
  );

  if (accessToken) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    };
  }

  try {
    if (!apiUrl) {
      throw new Error("Not found url");
    }

    const encrypted = encryptedPassword(configPassword, sessionKey, ivKey);

    const response = await fetch(`${apiUrl}/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: name, password: encrypted })
    }).then(res => res.json());

    await redis.set(
      `golomtbank_token_${clientId}:${sessionKey}`,
      response.token,
      "EX",
      response.expiresIn - 60
    );

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${response.token}`
    };
  } catch (e) {
    console.error(e.message);
    throw new Error("Authentication failed");
  }
};

export const formatDate = (date: string) => {
  return date.replace(/-/g, "");
};
