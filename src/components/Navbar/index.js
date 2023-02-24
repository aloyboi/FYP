import ScrollSpyMenu from "../../common/components/ScrollSpyMenu";
import Scrollspy from "react-scrollspy";
import AnchorLink from "react-anchor-link-smooth-scroll";
import { Icon } from "react-icons-kit";
import { menu } from "react-icons-kit/feather/menu";
import { x } from "react-icons-kit/feather/x";
import Logo from "../../common/components/UIElements/Logo";
import Button from "../../common/components/Button";
import Container from "../../common/components/UI/Container";
import NavbarWrapper, { MenuArea, MobileMenu } from "./navbar.style";
import LogoImage from "../../common/assets/image/cryptoModern/logo-white.png";
import LogoImageAlt from "../../common/assets/image/cryptoModern/logo.png";
import { navbar } from "../../common/data/CryptoModern";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LendingPlatform from "../LendingPlatform";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    SET_ACCOUNT,
    SET_DEPOSIT_AMOUNT,
    SET_TAB_VALUE,
} from "../../redux/redux-actions/actions";
import {
    getBorrowerData,
    getReserveData,
    deposit,
    withdraw,
} from "../../scripts/aaveLend";
import { ethers } from "ethers";
import { textColor } from "styled-system";

//const lendingPool = process.env.REACT_APP_LENDINGPOOLADDRESSV2;
const lendingPool = process.env.REACT_APP_LENDINGPOOLADDRESSV3;

const Navbar = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [tabValue, setTabValue] = useState("0");

    const dispatch = useDispatch();

    const getDeposit = async (account) => {
        const totalCollateralDAI = await getBorrowerData(account, lendingPool);
        dispatch({ type: SET_DEPOSIT_AMOUNT, payload: totalCollateralDAI });
    };

    const checkIfAccountChanged = () => {
        try {
            window.ethereum.on("accountsChanged", (account) => {
                if (account.length > 0) {
                    dispatch({ type: SET_ACCOUNT, payload: account[0] });
                    setCurrentAccount(account[0]);
                    getDeposit(account[0]);
                } else {
                    dispatch({ type: SET_ACCOUNT, payload: null });
                    dispatch({ type: SET_DEPOSIT_AMOUNT, payload: 1 });
                    setCurrentAccount("");
                }
            });
        } catch (error) {
            console.log(error);
        }
    };

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                dispatch({
                    type: SET_ACCOUNT,
                    payload: window.ethereum.selectedAddress,
                });
                setCurrentAccount(window.ethereum.selectedAddress);
                getDeposit(window.ethereum.selectedAddress);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleTabChange = (event, newValue) => {
        dispatch({ type: SET_TAB_VALUE, payload: newValue });
        setTabValue(newValue);
    };

    useEffect(() => {
        console.log(tabValue);
        checkIfAccountChanged();
    }, []);

    const clickHandler = () => {
        if (currentAccount === "") {
            connectWallet();
        }
    };

    return (
        <NavbarWrapper className="navbar">
            <Container>
                <Logo
                    href="/"
                    // logoSrc={LogoImage}
                    title="lenDEXchange"
                    className="main-logo"
                />
                <MenuArea style={{ position: "fixed", marginLeft: "270px" }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{ height: "40px" }}
                    >
                        <Tab label="Home" value="0" />
                        <Tab label="Decentralized Exchange" value="1" />
                        <Tab label="Lending Platform" value="2" />
                    </Tabs>
                </MenuArea>

                <MenuArea style={{ position: "fixed", marginLeft: "900px" }}>
                    <Button
                        className="trail"
                        title={currentAccount || "Not Connected"}
                        type="button"
                        onClick={clickHandler}
                    ></Button>
                </MenuArea>
            </Container>
        </NavbarWrapper>
    );
};

export default Navbar;
