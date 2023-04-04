import styled from "styled-components";
import { themeGet } from "@styled-system/theme-get";

const NavbarWrapper = styled.nav`
    width: 100%;
    padding: 25px 0 26px;
    background-color: #0d1940;
    position: fixed;
    top: 0;
    z-index: 9999;
    transition: all 0.3s ease;
    @media only screen and (max-width: 1366px) {
        padding: 20px 0 21px;
    }
    > div.container {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .main-logo {
            img {
                width: 128px;
                height: auto;
            }
        }
        .logo-alt {
            width: 128px;
            height: auto;
            display: none;
        }
    }
    ul {
        li {
            a {
                color: ${themeGet("colors.menu", "#fff")};
                font-size: 16px;
                font-weight: 400;
                transition: all 0.3s ease;
                &:hover {
                    font-weight: 700;
                }
            }
            &.is-current {
                a {
                    font-weight: 700;
                }
            }
        }
    }
`;

export const MenuArea = styled.div`
    display: flex;
    position: relative;
    align-items: center;
    .menu {
        display: flex;
        align-items: center;
        margin-right: 11px;
        opacity: 1;
        visibility: visible;
        transition: all 0.3s ease;
        @media only screen and (max-width: 1366px) {
            margin-right: 13px;
        }
        @media only screen and (max-width: 991px) {
            display: none;
        }
        li {
            margin: 0 19px;
            @media only screen and (max-width: 1366px) {
                margin: 0 17px;
            }
            &:first-child {
                margin-left: 0;
            }
            &:last-child {
                margin-right: 0;
            }
        }
    }
    &.active {
        .menu {
            opacity: 0;
            visibility: hidden;
        }
    }
    .reusecore__button {
        border-radius: 5px;
        font-weight: 500;
        text-transform: inherit;
        padding-left: 13px;
        padding-right: 13px;
        min-height: 42px;

        &.text {
            padding: 0;
            margin-right: 28px;
            cursor: pointer;
            .btn-icon {
                svg {
                    width: 22px;
                    height: auto;
                    stroke: ${themeGet("colors.menu", "0D233E")};
                    @media only screen and (max-width: 991px) {
                        width: 24px;
                    }
                }
            }
            @media only screen and (max-width: 1366px) {
                margin-right: 20px;
            }
            @media only screen and (max-width: 991px) {
                margin-right: 0;
            }
        }
        &.trail {
            border-radius: 4px;
            background-image: linear-gradient(to right, #4ba1d8, #4464bd 95%);
            &:hover {
                box-shadow: rgba(75, 109, 235, 0.78) 0px 12px 24px -10px;
            }
            @media only screen and (max-width: 991px) {
                display: none;
            }
        }
        &.menubar {
            display: none;
            @media only screen and (max-width: 991px) {
                display: inline-flex;
                padding: 0;
                justify-content: flex-end;
                min-width: 35px;
                color: #fff;
                svg {
                    width: 27px;
                    height: auto;
                }
            }
        }
    }
`;

export const MobileMenu = styled.div`
    display: none;
    @media only screen and (max-width: 991px) {
        display: flex;
        width: 100%;
        height: calc(100vh - 70px);
        padding: 27px 0 40px;
        opacity: 0;
        visibility: hidden;
        position: absolute;
        top: 82px;
        flex-direction: column;
        background-color: ${themeGet("colors.white", "#ffffff")};
        transition: all 0.3s ease;
        color: ${themeGet("colors.secondary", "#000")};
        &.active {
            opacity: 1;
            visibility: visible;
            box-shadow: 0 3px 12px
                ${themeGet("colors.shadow", "rgba(38, 78, 118, 0.1)")};
        }
        .container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        ul {
            padding-bottom: 20px;
            li {
                a {
                    display: block;
                    padding: 13px 0;
                    border-radius: 5px;
                    transition: all 0.3s ease;
                    color: ${themeGet("colors.secondary", "#000")};
                }
                &:hover {
                    a {
                        padding: 13px 15px;
                        color: ${themeGet("colors.primary")};
                    }
                }
            }
        }
        .reusecore__button {
            width: 100%;
            border-radius: 4px;
            background-image: -moz-linear-gradient(
                -31deg,
                rgb(64, 219, 216) 0%,
                rgb(44, 31, 132) 100%
            );
            background-image: -webkit-linear-gradient(
                -31deg,
                rgb(64, 219, 216) 0%,
                rgb(44, 31, 132) 100%
            );
            background-image: -ms-linear-gradient(
                -31deg,
                rgb(64, 219, 216) 0%,
                rgb(44, 31, 132) 100%
            );
            @media only screen and (max-width: 480px) {
                margin-top: 20px;
            }
        }
    }
`;

export default NavbarWrapper;
