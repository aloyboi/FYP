import React from "react";
import LendingPlatform from "../LendingPlatform";
import Banner from "../Banner";
import WorkHistory from "../WorkHistory";
import TabWrapper from "./TabMenu.style";

const TabMenu = (props) => {
    let { tabVal } = props;

    switch (tabVal) {
        case "0":
            console.log("entered");
            return (
                <TabWrapper>
                    <WorkHistory></WorkHistory>
                </TabWrapper>
            );

        case "1":
            console.log("entered");
            return (
                <TabWrapper>
                    <Banner></Banner>
                </TabWrapper>
            );

        case "2":
            console.log("entered");
            return (
                <TabWrapper>
                    <LendingPlatform></LendingPlatform>
                </TabWrapper>
            );

        default:
            return;
    }
};

export default TabMenu;
