import React from "react";
import Text from "../../common/components/Text";
import Heading from "../../common/components/Heading";
import NextImage from "../../common/components/NextImage";
import Container from "../../common/components/UI/Container";
import SectionWrapper, { ContentWrapper } from "./privacy.style";
import Illustration from "../../common/assets/image/cryptoModern/illustration1.png";

const PrivacyPortal = () => {
    return (
        <SectionWrapper>
            <Container>
                <ContentWrapper>
                    <div className="content">
                        <Heading content="Privacy Preserving  Anonymous Funds  Protocol" />
                        <Text content="Lorem ipsum dolor sit amet consectetur adipisicing elit sed eiu Lorem ipsum dolor sit amet consectetur adipisicing elit sed eiu" />
                    </div>
                    <div className="image">
                        <NextImage
                            src={Illustration}
                            alt="Illustration Image"
                        />
                    </div>
                </ContentWrapper>
            </Container>
        </SectionWrapper>
    );
};

export default PrivacyPortal;
