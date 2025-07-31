import { getConfig } from "./utils";

import * as AWS from "aws-sdk";
import * as nodemailer from "nodemailer";

export const createTransporter = async ({ ses }, configs) => {
  if (ses) {
    const AWS_SES_ACCESS_KEY_ID = getConfig(configs, "AWS_SES_ACCESS_KEY_ID");

    const AWS_SES_SECRET_ACCESS_KEY = getConfig(
      configs,
      "AWS_SES_SECRET_ACCESS_KEY"
    );
    const AWS_REGION = getConfig(configs, "AWS_REGION");

    AWS.config.update({
      region: AWS_REGION,
      accessKeyId: AWS_SES_ACCESS_KEY_ID,
      secretAccessKey: AWS_SES_SECRET_ACCESS_KEY,
    });

    return nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: "2010-12-01" }),
    });
  }

  const MAIL_SERVICE = configs["MAIL_SERVICE"] || "";
  const MAIL_PORT = configs["MAIL_PORT"] || "";
  const MAIL_USER = configs["MAIL_USER"] || "";
  const MAIL_PASS = configs["MAIL_PASS"] || "";
  const MAIL_HOST = configs["MAIL_HOST"] || "";

  let auth;

  if (MAIL_USER && MAIL_PASS) {
    auth = {
      user: MAIL_USER,
      pass: MAIL_PASS,
    };
  }

  return nodemailer.createTransport({
    service: MAIL_SERVICE,
    host: MAIL_HOST,
    port: MAIL_PORT,
    auth,
  });
};
