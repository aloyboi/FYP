import styled from "styled-components";
import { variant, alignItems, boxShadow } from "styled-system";
import { themeGet } from "@styled-system/theme-get";
import { buttonStyle, colorStyle, sizeStyle } from "../customVariant";
import { base } from "../base";

const MaxButtonStyle = styled.button`
    /* button default style */
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    height: 50px;
    border: 2px solid palevioletred;
    border-color: tomato;
    border-radius: 10px;
    margin-left: 10px;
    border
    justify-content: center;
    color: ${themeGet("colors.white", "#ffffff")};
    background-color: ${themeGet("colors.primary", "#028489")};
    font-family: inherit;
    font-size: ${themeGet("fontSizes.4", "16")}px;
    font-weight: ${themeGet("fontWeights.4", "500")};
    text-decoration: none;
    text-transform: capitalize;
    padding-top: ${themeGet("space.2", "8")}px;
    padding-bottom: ${themeGet("space.2", "8")}px;
    padding-left: ${themeGet("space.4", "15")}px;
    padding-right: ${themeGet("space.4", "15")}px;
    border: 10;
    transition: all 0.3s ease;
    span.btn-text {
        padding-left: ${themeGet("space.1", "4")}px;
        padding-right: ${themeGet("space.1", "4")}px;
    }
    span.btn-icon {
        display: flex;
        > div {
            display: flex !important;
        }
    }

    &:focus {
        outline: none;
    }

    /* Material style goes here */
    &.is-material {
        box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.2),
            0px 2px 2px 0px rgba(0, 0, 0, 0.14),
            0px 3px 1px -2px rgba(0, 0, 0, 0.12);
    }

    /* When button on loading stage */
    &.is-loading {
        .btn-text {
            padding-left: ${themeGet("space.2", "8")}px;
            padding-right: ${themeGet("space.2", "8")}px;
        }
    }

    /* Style system support */
    ${alignItems}
    ${boxShadow}
  ${buttonStyle}
  ${colorStyle}
  ${sizeStyle}
  ${base}
`;

// prop types can also be added from the style functions
MaxButtonStyle.propTypes = {
    ...alignItems.propTypes,
    ...boxShadow.propTypes,
    ...variant.propTypes,
};

MaxButtonStyle.displayName = "MaxButtonStyle";

export default MaxButtonStyle;
