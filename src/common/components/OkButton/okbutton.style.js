import styled from "styled-components";
import { variant, alignItems, boxShadow } from "styled-system";
import { themeGet } from "@styled-system/theme-get";
import { buttonStyle, colorStyle, sizeStyle } from "../customVariant";
import { base } from "../base";

const OkButtonStyle = styled.button`
    /* button default style */
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    height: 50px;
    border-radius: 10px;
    border-style: solid;
    border: 2px solid palevioletred;
    justify-content: center;
    color: ${themeGet("colors.white", "#ffffff")};
    font-family: inherit;
    font-size: ${themeGet("fontSizes.4", "16")}px;
    font-weight: ${themeGet("fontWeights.4", "500")};
    text-decoration: none;
    text-transform: capitalize;
    border: 10;
    transition: all 0.3s ease;
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
OkButtonStyle.propTypes = {
    ...alignItems.propTypes,
    ...boxShadow.propTypes,
    ...variant.propTypes,
};

OkButtonStyle.displayName = "OkButtonStyle";

export default OkButtonStyle;
