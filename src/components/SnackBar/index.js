import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { IS_MESSAGE_DISPLAY } from "../../redux/redux-actions/actions";
import "./index.css";

export default function SnackBar() {
    const message = useSelector((state) => state.message.message);
    const vertical = "top";
    const horizontal = "center";
    const isMessageDisplay = useSelector(
        (state) => state.message.is_message_display
    );
    const dispatch = useDispatch();

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        dispatch({
            type: IS_MESSAGE_DISPLAY,
            payload: false,
        });
    };

    const action = (
        <React.Fragment>
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </React.Fragment>
    );

    return (
        <div>
            <Snackbar
                anchorOrigin={{ vertical, horizontal }}
                open={isMessageDisplay}
                autoHideDuration={5}
                message={message}
                action={action}
                key={vertical + horizontal}
                bodyStyle={{ minWidth: 1000, flexGrow: 0 }}
            />
        </div>
    );
}
