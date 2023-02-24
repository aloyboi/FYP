import Text from "../../common/components/Text";
import NextImage from "../../common/components/NextImage";
import Button from "../../common/components/Button";
import Heading from "../../common/components/Heading";
import Container from "../../common/components/UI/Container";
import Input from "../../common/components/Input";
import MaxButton from "../../common/components/MaxButton";
//import InputGroup from "../../common/components/InputGroup";
import OkButton from "../../common/components/OkButton";
import BannerWrapper, {
    BannerContent,
    DiscountLabel,
    BannerImage,
    ButtonGroup,
    CardBox,
    SubCardBox,
} from "./banner.style";
import Card from "../../common/components/Card";
import Logo from "../../common/components/UIElements/Logo";

import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    getBorrowerData,
    getReserveData,
    deposit,
    withdraw,
    getDAIBalance,
} from "../../scripts/aaveLend";
import { SET_INTEREST_RATE } from "../../redux/redux-actions/actions";
import bannerImg from "../../common/assets/image/cryptoModern/banner-bg.png";

//const lendingPool = process.env.REACT_APP_LENDINGPOOLADDRESSV2; //Aave Lending Pool Address that we will be using
const lendingPool = process.env.REACT_APP_LENDINGPOOLADDRESSV3;

const LendingPlatform = () => {
    const [totalCollateralDAI, setTotalCollatoralDAI] = useState("");
    const [interestRate, setInterestRate] = useState(0);
    const [amountToDeposit, setAmountToDeposit] = useState(0);
    const [amountToWithdraw, setAmountToWithdraw] = useState(0);
    const [selectedWithdraw, setSelectedWithdraw] = useState(false);
    const [selectedDeposit, setSelectedDeposit] = useState(false);
    const [balanceDAI, setBalanceDai] = useState(0);
    const curr = useSelector((state) => state.account.address);
    const currDeposit = useSelector((state) => state.account.deposit);
    const interest = useSelector((state) => state.account.interest);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log("entered");
        getUserData();
        getInterestRate();
    }, []);

    useEffect(() => {
        if (currDeposit) {
            setTotalCollatoralDAI(currDeposit);
        }

        if (curr) {
            getUserData();
            getInterestRate();
        }

        if (interest) {
            console.log("entered");
            setInterestRate(0);
        }

        const interval = setInterval(() => {
            getUserData();
            getInterestRate();
            console.log("This will run every minute!");
        }, 60000);
        return () => clearInterval(interval);
    }, [currDeposit, curr, interest]);

    const getUserData = async () => {
        if (curr !== null) {
            let totalCollateralDAI = (
                await getBorrowerData(curr, lendingPool)
            ).toString();
            let balanceDAI = await getDAIBalance(curr);

            setBalanceDai(balanceDAI);
            setTotalCollatoralDAI(totalCollateralDAI);
        }
    };

    const getInterestRate = async () => {
        if (curr !== null) {
            let intRate = await getReserveData(lendingPool);
            dispatch({ type: SET_INTEREST_RATE, payload: intRate });
            setInterestRate(intRate);
        }
    };

    const onClickSelectedDeposit = async () => {
        setSelectedDeposit(!selectedDeposit);
        setSelectedWithdraw(false);
    };
    const onClickSelectedWithdraw = async () => {
        setSelectedWithdraw(!selectedWithdraw);
        setSelectedDeposit(false);
    };

    const onClickDeposit = async () => {
        if (curr !== null) {
            console.log(
                "amount to deposit: " +
                    ethers.utils.parseUnits(amountToDeposit.toString(), 18)
            );
            let tx = await deposit(
                ethers.utils.parseUnits(amountToDeposit.toString(), 18),
                curr,
                lendingPool
            );
            getUserData();
        }
    };

    const onClickWithdraw = async () => {
        if (curr !== null) {
            console.log(
                "amount to withdraw: " +
                    ethers.utils.parseUnits(amountToWithdraw.toString(), 18)
            );
            let tx = await withdraw(
                ethers.utils.parseUnits(amountToWithdraw.toString(), 18),
                curr,
                lendingPool
            );
            getUserData();
        }
    };

    const onClickWhitePaper = async () => {
        window.location.href = "https://docs.aave.com/hub/";
    };

    return (
        <BannerWrapper id="LendingPlatform">
            <Container>
                <BannerContent>
                    <DiscountLabel>
                        <Text
                            className="discountAmount"
                            content="Lending Platform"
                        />
                        <Text
                            className="discountText"
                            content="powered by Aave"
                        />
                    </DiscountLabel>
                    <DiscountLabel>
                        <Text
                            className="discountAmount"
                            content="Total Deposit: "
                        />
                        <Text
                            className="discountText"
                            content={
                                totalCollateralDAI != 0
                                    ? totalCollateralDAI + " DAI"
                                    : "0 DAI"
                            }
                        />
                    </DiscountLabel>
                    <DiscountLabel justify-content="left">
                        <Text
                            className="discountAmount"
                            content="Interest Rate (APY):"
                        />
                        <Text
                            className="discountText"
                            content={interestRate + "%"}
                        />
                    </DiscountLabel>
                    <DiscountLabel>
                        <Text
                            className="discountAmount"
                            content="Balance DAI:"
                        />
                        <Text
                            className="discountText"
                            content={balanceDAI + " DAI"}
                        />
                    </DiscountLabel>
                    <ButtonGroup>
                        <Button
                            className="primary"
                            title="DEPOSIT"
                            onClick={onClickSelectedDeposit}
                        ></Button>
                        <Button
                            className="text"
                            variant="outlined"
                            title="Withdraw"
                            onClick={onClickSelectedWithdraw}
                        ></Button>
                    </ButtonGroup>
                    <div>
                        {selectedDeposit ? (
                            <div>
                                <DiscountLabel>
                                    <Text
                                        content="Deposit Amount: "
                                        className="discountAmount"
                                    ></Text>
                                    {/* <Input
                                    inputType="text"
                                    value={amountToDeposit}
                                ></Input> */}
                                    <input
                                        type="text"
                                        value={amountToDeposit}
                                        onChange={(e) =>
                                            setAmountToDeposit(e.target.value)
                                        }
                                    />
                                    <MaxButton
                                        className="text"
                                        variant="textButton"
                                        title="Max"
                                        onClick={() => {
                                            setAmountToDeposit(balanceDAI);
                                            console.log(amountToDeposit);
                                        }}
                                    ></MaxButton>
                                </DiscountLabel>
                                <OkButton
                                    className="text"
                                    variant="textButton"
                                    title="Deposit"
                                    onClick={onClickDeposit}
                                ></OkButton>
                            </div>
                        ) : selectedWithdraw ? (
                            <div>
                                <DiscountLabel>
                                    <Text
                                        content="Withdraw Amount: "
                                        className="discountAmount"
                                    ></Text>
                                    {/* <Input
                                    value={amountToWithdraw}
                                    onChange={(e) =>
                                        setAmountToWithdraw(e.target.value)
                                    }
                                ></Input> */}
                                    <input
                                        type="text"
                                        value={amountToWithdraw}
                                        onChange={(e) =>
                                            setAmountToWithdraw(e.target.value)
                                        }
                                    />
                                    <MaxButton
                                        className="text"
                                        variant="textButton"
                                        title="Max"
                                        onClick={() =>
                                            setAmountToWithdraw(
                                                totalCollateralDAI
                                            )
                                        }
                                    ></MaxButton>
                                </DiscountLabel>
                                <OkButton
                                    className="text"
                                    variant="textButton"
                                    title="Withdraw"
                                    onClick={onClickWithdraw}
                                ></OkButton>
                            </div>
                        ) : (
                            ""
                        )}
                    </div>
                </BannerContent>

                <BannerImage>
                    <NextImage src={bannerImg} alt="Banner" />
                </BannerImage>
            </Container>
        </BannerWrapper>
    );
};

export default LendingPlatform;
