import React from "react";
import Text from "../../common/components/Text";
import NextImage from "../../common/components/NextImage";
import Button from "../../common/components/Button";
import Heading from "../../common/components/Heading";
import Container from "../../common/components/UI/Container";
import BannerWrapper, {
    BannerContent,
    DiscountLabel,
    BannerImage,
    ButtonGroup,
} from "./home.style";
import FaqSection from "../FaqSection";
import { useState, useEffect } from "react";

import bannerImg from "../../common/assets/image/cryptoModern/banner-bg.png";

const Home = () => {
    const [selectLearnMore, setSelectLearnMore] = useState(false);

    return (
        <BannerWrapper id="home">
            <Container>
                <BannerContent>
                    {/* <DiscountLabel>
                        <Text
                            className="discountAmount"
                            content="Lending Platform"
                        />
                        <Text
                            className="discountText"
                            content="powered by Aave"
                        />
                    </DiscountLabel> */}
                    <Heading as="h1" content="Welcome" />
                    <Text content="lenDEXchange is a new DeFi Application that incorporates a Decentralized Exchange together with a Yield Farm powered by Aave Protocol" />
                    <ButtonGroup>
                        <Button
                            className="primary"
                            title="LEARN MORE"
                            onClick={() => setSelectLearnMore(!selectLearnMore)}
                        />

                        <a href="https://docs.aave.com/faq/depositing-and-earning/">
                            {" "}
                            <Button
                                className="text"
                                variant="textButton"
                                title="AAVE WHITE PAPER"
                            />
                        </a>
                    </ButtonGroup>
                </BannerContent>
                {selectLearnMore ? (
                    <FaqSection></FaqSection>
                ) : (
                    <BannerImage>
                        <NextImage src={bannerImg} alt="Banner" />
                    </BannerImage>
                )}
            </Container>
        </BannerWrapper>
    );
};

export default Home;
