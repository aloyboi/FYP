/* ------------------------------------ */
// Navbar data section
/* ------------------------------------ */
import featureIcon1 from "../../../common/assets/image/cryptoModern/feature-1.png";
import featureIcon2 from "../../../common/assets/image/cryptoModern/feature-2.png";
import featureIcon3 from "../../../common/assets/image/cryptoModern/feature-3.png";
import featureIcon4 from "../../../common/assets/image/cryptoModern/feature-4.png";
import walletIcon1 from "../../../common/assets/image/cryptoModern/wallet1.png";
import walletIcon2 from "../../../common/assets/image/cryptoModern/wallet2.png";
import walletIcon3 from "../../../common/assets/image/cryptoModern/wallet3.png";
import logo from "../../../common/assets/image/cryptoModern/apple.png";

export const navbar = {
    logo: logo,
    navMenu: [
        {
            id: 1,
            label: "DEX Exchange",
            path: "#home",
            offset: "84",
        },
    ],
};

/* ------------------------------------ */
// Features data section
/* ------------------------------------ */

export const Features = [
    {
        id: 1,
        icon: featureIcon1,
        title: "Great Market Value",
        description:
            "The leading digital currency by market capitalization, has grown in value by more than 10 times.",
    },
    {
        id: 2,
        icon: featureIcon2,
        title: "Verified Mining",
        description:
            "Your mining rigs are already set up and running. As soon as you set up your account.",
    },
    {
        id: 3,
        icon: featureIcon3,
        title: "Fastest Miner",
        description:
            "Don’t wrestle with rig assembly and hot, noisy miners at home. We have the fastest bitcoin mining.",
    },
    {
        id: 4,
        icon: featureIcon4,
        title: "Secure Transactions",
        description:
            "You can mine any cryptocurrency available in our catalogue! Switch your mining power.",
    },
];

/* ------------------------------------ */
// Wallet  data section
/* ------------------------------------ */

export const WalletFeatures = [
    {
        id: 1,
        icon: walletIcon1,
        title: "Secure transfers with verified Casinos.",
    },
    {
        id: 2,
        icon: walletIcon2,
        title: "Easily buy and sell CLV within the wallet",
    },
    {
        id: 3,
        icon: walletIcon3,
        title: "Pay as many as you want",
    },
];

/* ------------------------------------ */
// Faq  data section
/* ------------------------------------ */

export const Faq = [
    {
        id: 1,
        expend: true,
        title: "What is lenDEXchange DApp?",

        description:
            "lendDEXchange is an integrated Yield Farming & Decentralized Exchange platform for users to earn interests while utilising the exchange for trading",
    },
    {
        id: 2,
        expend: true,
        title: "Decentralized Exchange",
        description:
            "lendDEXchange's Decentralized Exchange allows users to make limit orders for supported ERC20 tokens based on a traditional order book system automated by our smart contract. A platform fee of 0.1% applies per order made",
    },
    {
        id: 3,
        expend: true,
        title: "Lending Platform",
        description:
            "lendDEXchange's Lending Platform allows users to tap on Aave protocol's liquidity reserve to earn interests from their DAI liquidity pool.  Users earn aDAI interest bearing tokens when they deposit into the pool. These tokens can be used to waive fees in the Decentralized Exchange",
    },
    {
        id: 4,
        title: "Are there fees for the DEX?",
        description:
            "Yes, a platform fee of 0.1% applies to every order that is made. Users can select the Waiver Fee option when making limit orders to waive off fees using interest tokens earned from the Lending Platform",
    },
    {
        id: 5,
        title: "How are fees calculated?",
        description:
            "Fees are calculated based on the value of the trade carried out. (Limit order rate x Limit order amount x 0.1%). ",
    },
    {
        id: 6,
        title: "aDAI Tokens",
        description:
            "If Users selected the option to waiver fees, the fees will be deducted from the balance aDAI deposited in the exchange. " +
            " In the event Users do not select the Waiver Fee option/Users have insufficient aDAI deposited to pay the fees, the fees will be deducted from the order amount that they are initially receiving directly",
    },
];

/* ------------------------------------ */
// Footer data section
/* ------------------------------------ */
export const Footer_Data = [
    {
        title: "About Us",
        menuItems: [
            {
                url: "#",
                text: "Support Center",
            },
            {
                url: "#",
                text: "Customer Support",
            },
            {
                url: "#",
                text: "About Us",
            },
            {
                url: "#",
                text: "Copyright",
            },
            {
                url: "#",
                text: "Popular Campaign",
            },
        ],
    },
    {
        title: "Our Information",
        menuItems: [
            {
                url: "#",
                text: "Return Policy",
            },
            {
                url: "#",
                text: "Privacy Policy",
            },
            {
                url: "#",
                text: "Terms & Conditions",
            },
            {
                url: "#",
                text: "Site Map",
            },
            {
                url: "#",
                text: "Store Hours",
            },
        ],
    },
    {
        title: "My Account",
        menuItems: [
            {
                url: "#",
                text: "Press inquiries",
            },
            {
                url: "#",
                text: "Social media directories",
            },
            {
                url: "#",
                text: "Images & B-roll",
            },
            {
                url: "#",
                text: "Permissions",
            },
            {
                url: "#",
                text: "Speaker requests",
            },
        ],
    },
    {
        title: "Policy",
        menuItems: [
            {
                url: "#",
                text: "Application security",
            },
            {
                url: "#",
                text: "Software principles",
            },
            {
                url: "#",
                text: "Unwanted software policy",
            },
            {
                url: "#",
                text: "Responsible supply chain",
            },
        ],
    },
];
