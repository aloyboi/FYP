import { Helmet, HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "styled-components";
import { theme } from "../common/theme/appModern";
import ResetCSS from "../common/assets/css/style";
import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import LendingPlatform from "../components/LendingPlatform";
import WorkHistory from "../components/WorkHistory";
import SnackBar from "../components/SnackBar";

import GlobalStyle, {
    CryptoWrapper,
    ContentWrapper,
} from "../components/main.style";
import DexExchange from "../components/DexExchange";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const Exchange = () => {
    const tabVal = useSelector((state) => state.tabValue.value);
    const [tabValue, setTabValue] = useState("0");

    useEffect(() => {
        setTabValue(tabVal);
    }, [tabVal]);

    if (tabValue === "0") {
        return (
            <ThemeProvider theme={theme}>
                <>
                    <HelmetProvider>
                        <Helmet>
                            <title>Exchange</title>
                            <meta
                                name="Description"
                                content="React next landing page"
                            />
                            <meta name="theme-color" content="#2563FF" />
                            <meta
                                name="keywords"
                                content="React, React js, Next, Next js, Super fast next js landing, Modern landing, Next js landing"
                            />
                            <link
                                href="https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i"
                                rel="stylesheet"
                            />
                        </Helmet>
                    </HelmetProvider>

                    <ResetCSS />
                    <GlobalStyle />

                    <CryptoWrapper>
                        <ContentWrapper>
                            <Navbar></Navbar>
                            <Banner></Banner>
                        </ContentWrapper>
                    </CryptoWrapper>
                </>
            </ThemeProvider>
        );
    } else if (tabValue === "1") {
        return (
            <ThemeProvider theme={theme}>
                <>
                    <HelmetProvider>
                        <Helmet>
                            <title>Exchange</title>
                            <meta
                                name="Description"
                                content="React next landing page"
                            />
                            <meta name="theme-color" content="#2563FF" />
                            <meta
                                name="keywords"
                                content="React, React js, Next, Next js, Super fast next js landing, Modern landing, Next js landing"
                            />
                            <link
                                href="https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i"
                                rel="stylesheet"
                            />
                        </Helmet>
                    </HelmetProvider>

                    <ResetCSS />
                    <GlobalStyle />

                    <CryptoWrapper>
                        <ContentWrapper>
                            <Navbar></Navbar>
                            <DexExchange></DexExchange>

                            <SnackBar />
                        </ContentWrapper>
                    </CryptoWrapper>
                </>
            </ThemeProvider>
        );
    } else if (tabValue === "2") {
        return (
            <ThemeProvider theme={theme}>
                <>
                    <HelmetProvider>
                        <Helmet>
                            <title>Exchange</title>
                            <meta
                                name="Description"
                                content="React next landing page"
                            />
                            <meta name="theme-color" content="#2563FF" />
                            <meta
                                name="keywords"
                                content="React, React js, Next, Next js, Super fast next js landing, Modern landing, Next js landing"
                            />
                            <link
                                href="https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i"
                                rel="stylesheet"
                            />
                        </Helmet>
                    </HelmetProvider>
                    <ResetCSS />
                    <GlobalStyle />

                    <CryptoWrapper>
                        <ContentWrapper>
                            <Navbar />
                            <LendingPlatform />
                        </ContentWrapper>
                    </CryptoWrapper>
                </>
            </ThemeProvider>
        );
    }
};
export default Exchange;
