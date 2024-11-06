import {
  Authors,
  LeftSideContent,
  PlayVideo,
  RightSideContent,
  SetupBox,
  SetupBoxes,
  SetupSteps,
  SmallBox,
  WelcomeWrapper
} from "../stylesSaas";
import {
  Community,
  FrontlineTasks,
  GeneralTasks,
  Learn,
  MarketingTasks,
  OperationTasks,
  SalesTasks,
  Setups
} from "../constants";
import { IOnboardingHistory, IOrganization } from "@erxes/ui/src/auth/types";

import Drawer from "@erxes/ui/src/components/Drawer";
import DrawerContent from "../container/DrawerContent";
import { IUser } from "modules/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import Wrapper from "modules/layout/components/Wrapper";
import _ from "lodash";
import { __ } from "modules/common/utils";
import dayjs from "dayjs";

type Props = {
  currentUser: IUser;
  // branchesLength: number;
  // departmentLength: number;
};

function Welcome({ currentUser }: Props) {
  const {
    currentOrganization = {} as IOrganization,
    onboardingHistory = {} as IOnboardingHistory
  } = currentUser || ({} as IUser);
  const { experience = {} as any } = currentOrganization;
  const { completedSteps = [] as string[] } =
    onboardingHistory || ({} as IOnboardingHistory);

  const renderLeftContent = () => {
    const currentDate = dayjs().format("MMM D, YYYY");

    return (
      <>
        <h6>{__("Get start")}</h6>
        <h3>{__("What is Self-hosted? Open-Source Software(OSS)")}</h3>
        <Authors>
          By
          <img src="/images/welcome/ceo.png" alt="ceo" />
          On {currentDate}
        </Authors>
        <p>
          erxes source code is freely available to the public.
          <br />
          <br />
          Users can modify, enhance, and distribute the software within the
          limits of the license allows. Examples include Linux, Apache web
          server, and WordPress.
          <br />
          <br />
          It’s typically free to use, but some projects may offer paid support
          or services. For more...
        </p>
        <PlayVideo>
          <img src="/images/welcome/item-1.png" alt="item-1" />
          <a
            href="https://erxes.io/resources/blog/day-1-erxes-io-and-marketplace-improvements"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon icon="play" />
          </a>
        </PlayVideo>
      </>
    );
  };

  const renderTotal = (totalStep: number, tasks) => {
    const completedCount =
      (tasks || []).filter(task => completedSteps.includes(task.action))
        .length || 0;
    return (
      <span>
        {completedCount}/{totalStep} steps
      </span>
    );
  };

  const renderSetupItem = item => {
    const { id, title, type, image, desc, comingSoon } = item;
    const eCode = experience?.customCode || "";

    const operationTasks =
      eCode === "marketing"
        ? MarketingTasks
        : eCode === "sales"
          ? SalesTasks
          : eCode === "frontline"
            ? FrontlineTasks
            : eCode === "operation"
              ? OperationTasks
              : [];

    const tasks =
      type === "general"
        ? GeneralTasks
        : type === "operational"
          ? operationTasks
          : [];

    return (
      <SetupBox key={id} comingSoon={comingSoon}>
        <div>
          <img src={image} alt={`item-${id}`} />
        </div>
        <h4>{title}</h4>
        <p>{desc}</p>
        <SetupSteps disabled={comingSoon ? true : false}>
          <Drawer
            title={comingSoon ? "Coming soon" : "Get Started"}
            side="right"
            width={35}
            btnStyle="link"
          >
            {setShow => (
              <DrawerContent
                content={item}
                setShow={setShow}
                tasks={tasks}
                completedSteps={completedSteps}
              />
            )}
          </Drawer>
          {!comingSoon &&
            renderTotal(
              type === "general"
                ? GeneralTasks.length || 0
                : operationTasks.length || 0,
              type === "general" ? GeneralTasks : operationTasks
            )}
        </SetupSteps>
      </SetupBox>
    );
  };

  const renderSmallBox = item => {
    const { id, title, image, desc, url } = item;

    return (
      <SmallBox href={url} key={id} target="_blank">
        <img src={image} alt={`item-${id}`} />
        <div>
          <h4>{title}</h4>
          <p>{desc}</p>
        </div>
      </SmallBox>
    );
  };

  const content = (
    <WelcomeWrapper>
      <LeftSideContent>{renderLeftContent()}</LeftSideContent>
      <RightSideContent>
        <section>
          <h4>Recommended setup</h4>
          <p>
            Explore our library of educational content to learn how to set up
            and manage your erxes project.
          </p>
          <SetupBoxes>{Setups.map(item => renderSetupItem(item))}</SetupBoxes>
        </section>
        <section>
          <h4>Learn with erxes</h4>
          <p>
            Explore our library of educational content to learn how to set up
            and manage your erxes project.
          </p>
          <SetupBoxes>{Learn.map(l => renderSmallBox(l))}</SetupBoxes>
        </section>
        <section>
          <h4>Connect with the erxes community</h4>
          <p>Join the conversation with users from all over the world.</p>
          <SetupBoxes> {Community.map(l => renderSmallBox(l))}</SetupBoxes>
        </section>
      </RightSideContent>
    </WelcomeWrapper>
  );

  return (
    <Wrapper content={content} transparent={true} initialOverflow={true} />
  );
}

export default Welcome;
