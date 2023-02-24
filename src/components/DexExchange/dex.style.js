import styled from "styled-components";

export const DexExchangeContainer = styled.section`
    padding: 70px 0 80px;
    background-image: linear-gradient(
        135deg,
        rgba(64, 219, 216, 0.15) 0%,
        rgba(3, 16, 59, 0.15) 35%
    );
    @media only screen and (min-width: 1201px) and (max-width: 1440px) {
        min-height: 100%;
    }
    @media only screen and (max-width: 1099px) {
        padding-top: 120px;
        min-height: 100%;
    }
    @media only screen and (max-width: 480px) {
        padding-top: 120px;
        min-height: 100%;
    }
`;

export const ButtonDex = styled.div`
    display: flex;
    justify-content: center;
    align-self: center;
`;

export const CurrencyContainer = styled.div`
    display: flex;
    justify-content: center;
    align-self: center;
`;

export default DexExchangeContainer;
