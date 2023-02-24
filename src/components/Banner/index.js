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
} from "./banner.style";

import bannerImg from "../../common/assets/image/cryptoModern/banner-bg.png";

const Banner = () => {
    return (
        <BannerWrapper id="home">
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
                    <Heading as="h1" content="Welcome " />
                    <Text
                        content="Lorem ipsum dolor sit amet consectetur adipisicing elit sed eiusmod tempor incididunt labore dolore magna
          ipsum dolor sit amet consectetur."
                    />
                    <ButtonGroup>
                        <Button className="primary" title="GET TOKEN" />
                        <Button
                            className="text"
                            variant="textButton"
                            title="WHITE PAPER"
                        />
                    </ButtonGroup>
                </BannerContent>
                <BannerImage>
                    <NextImage src={bannerImg} alt="Banner" />
                </BannerImage>
            </Container>
        </BannerWrapper>
    );
};

export default Banner;
