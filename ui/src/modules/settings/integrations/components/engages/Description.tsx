import Info from 'modules/common/components/Info';
import React from 'react';

function Description() {
  return (
    <>
      <Info bordered={false}>
        <p>
          <strong>
            Configure Amazon SES and Amazon SNS to track each email responses
          </strong>
        </p>
        <ol>
          <li>
            <a
              href="https://console.aws.amazon.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Log in to your AWS Management Console.
            </a>
          </li>
          <li>Click on your user name at the top right of the page.</li>
          <li>
            Click on the My Security Credentials link from the drop-down menu.
          </li>
          <li>Click on the Users menu from left Sidebar.</li>
          <li>Click on the Add user.</li>
          <li>
            Then create your username and check Programmatic access type and
            click next.
          </li>
          <li>
            Click on the Create group then write group name and check
            amazonSesFullAccess and amazonSNSFullAccess.
          </li>
          <li>Then check your created group and click on the Next button.</li>
          <li>
            Finally click on the create user and copy the Access Key Id and
            Secret Access Key.
          </li>
        </ol>
      </Info>
      <Info bordered={false}>
        <p>
          <strong>To find your Region:</strong>
        </p>
        <ol>
          <li>
            <a
              href="https://console.aws.amazon.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Log in to your AWS Management Console.
            </a>
          </li>
          <li>Click on services menu at the top left of the page.</li>
          <li>Find Simple Email Service and Copy region code from url.</li>
        </ol>
        <p>If you choose not available region</p>
        <ol>
          <li>Click on your region at the top right of the menu.</li>
          <li>Select any active region from list.</li>
          <li>
            Copy the selected Region code. <br />
            <i>
              (example: us-east-1, us-west-2, ap-south-1, ap-southeast-2,
              eu-central-1, eu-west-1)
            </i>
          </li>
        </ol>
      </Info>

      <Info bordered={false}>
        <p>
          <strong>To determine if your account is in the sandbox:</strong>
        </p>
        <ol>
          <li>
            <a
              href="https://console.aws.amazon.com/ses/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open the Amazon SES console at https://console.aws.amazon.com/ses/
            </a>
          </li>
          <li>Use the Region selector to choose an AWS Region.</li>
          <li>
            If your account is in the sandbox in the AWS Region that you
            selected, you see a banner at the top of the page that resembles the
            example in the following image.
            <img
              alt="sandbox"
              style={{ maxWidth: '100%' }}
              src="/images/sandbox-banner-send-statistics.png"
            />
          </li>
          <li>
            If so follow the instructions described{' '}
            <a
              href="https://docs.aws.amazon.com/ses/latest/DeveloperGuide/request-production-access.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>{' '}
            to move out of the Amazon SES Sandbox
          </li>
        </ol>
      </Info>
    </>
  );
}

export default Description;
