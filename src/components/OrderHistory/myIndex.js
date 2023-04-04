import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import Button from "@mui/material/Button";
import { cancelOrder } from "../../scripts/functions";
import {
    SET_IS_ANY_ORDER_CANCELLED,
    LOG_MESSAGE,
    IS_MESSAGE_DISPLAY,
} from "../../redux/redux-actions/actions";
import { Typography } from "@mui/material";
import { useState } from "react";

export default function StickyHeadTable(props) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const dispatch = useDispatch();

    const buyRows = useSelector((state) => state.orders.user_buy_orders);
    const sellRows = useSelector((state) => state.orders.user_sell_orders);
    const filledRows = useSelector((state) => state.orders.user_filled_orders);
    const curr = useSelector((state) => state.account.address);
    const refToken = useSelector((state) => state.token.curr_ref_token);
    const againstToken = useSelector((state) => state.token.curr_against_token);
    const allToken = useSelector((state) => state.token.all_tokens);
    const myOrderTypeSelected = useSelector(
        (state) => state.tabValue.myOrderTypeSelected
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleCancelOrder = (side, tokenA, tokenB, ordID) => {
        displayTempMessage("Cancelling Order");
        let tokenA_add = allToken.filter((token) => token.symbol === tokenA)[0]
            .address;
        let tokenB_add = allToken.filter((token) => token.symbol === tokenB)[0]
            .address;
        console.log(tokenA_add);
        console.log(tokenB_add);
        console.log(ordID);
        console.log(side);

        cancelOrder(
            tokenA_add,
            tokenB_add,
            ordID,
            side,

            (e) => {
                dispatch({ type: SET_IS_ANY_ORDER_CANCELLED, payload: true });
                displayTempMessage("Order Cancelled");
            },
            displayTempMessage
        );
    };

    const displayTempMessage = (message) => {
        dispatch({
            type: LOG_MESSAGE,
            payload: message,
        });
        dispatch({
            type: IS_MESSAGE_DISPLAY,
            payload: true,
        });
        setTimeout(() => {
            dispatch({
                type: LOG_MESSAGE,
                payload: "",
            });
            dispatch({
                type: IS_MESSAGE_DISPLAY,
                payload: false,
            });
        }, 2000);
    };

    const buyColumns = [
        {
            id: "orderId",
            label: "Order ID",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "tokenA",
            label: "Buy Token",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "tokenB",
            label: "Sell Token",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "amountA",
            label: "Amount Remaining",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "originalAmountA",
            label: "Amount Original",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },

        {
            id: "rate",
            label: "Rate",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "waiveFees",
            label: "Opt Waive Fees",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
    ];

    const sellColumns = [
        {
            id: "orderId",
            label: "Order ID",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "tokenA",
            label: "Sell Token",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "tokenB",
            label: "Buy Token",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "amountA",
            label: "Amount Remaining",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "originalAmountA",
            label: "Amount Original",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },

        {
            id: "rate",
            label: "Rate",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "waiveFees",
            label: "Opt Waive Fees",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
    ];

    const filledColumns = [
        {
            id: "orderId",
            label: "From Order ID",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "type",
            label: "Order Type",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "tokenA",
            label: "For Token",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "tokenB",
            label: "Against Token",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "amountFilled",
            label: "Amount Filled",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "fillRate",
            label: "Rate filled",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "originalRate",
            label: "Original Rate",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "waiveFees",
            label: "Opt Waive Fees",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "feesPaid",
            label: "Fees paid (USD)",
            minWidth: 130,
            align: "center",
            format: (value) => value.toLocaleString("en-US"),
        },
    ];

    // useEffect(() => {
    //     // eslint-disable-next-line
    // }, [props.startQuery]);

    if (myOrderTypeSelected === 0) {
        return (
            <div>
                <TableContainer sx={{ maxHeight: 440, zIndex: "0" }}>
                    <Table stickyHeader sx={{ zIndex: "0" }}>
                        <TableHead sx={{ zIndex: "0" }}>
                            <TableRow>
                                {buyColumns.map((column) => (
                                    <TableCell
                                        sx={{
                                            color: "white",
                                            backgroundColor: "rgba(3,16,58)",
                                            zIndex: "0",
                                        }}
                                        key={column.id}
                                        align={column.align}
                                        style={{
                                            minWidth: column.minWidth,
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                                <TableCell
                                    sx={{
                                        color: "white",
                                        backgroundColor: "rgba(3,16,58)",
                                        zIndex: "0",
                                    }}
                                    key={"cancel"}
                                    align={"center"}
                                    style={{ minWidth: 130 }}
                                ></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {buyRows
                                ? buyRows
                                      .slice(
                                          page * rowsPerPage,
                                          page * rowsPerPage + rowsPerPage
                                      )
                                      .map((rows) => {
                                          return (
                                              <TableRow
                                                  hover
                                                  role="checkbox"
                                                  key={rows.orderId}
                                              >
                                                  {buyColumns.map((column) => {
                                                      const value =
                                                          rows[column.id];
                                                      return (
                                                          <TableCell
                                                              sx={{
                                                                  color: "white",
                                                              }}
                                                              key={column.id}
                                                              align={
                                                                  column.align
                                                              }
                                                          >
                                                              {column.format &&
                                                              typeof value ===
                                                                  "number"
                                                                  ? column.format(
                                                                        value
                                                                    )
                                                                  : value}
                                                          </TableCell>
                                                      );
                                                  })}
                                                  <TableCell
                                                      sx={{
                                                          color: "white",
                                                      }}
                                                      key={"cancel"}
                                                      align={"center"}
                                                      style={{ minWidth: 130 }}
                                                  >
                                                      <Button
                                                          variant="contained"
                                                          sx={{
                                                              backgroundColor:
                                                                  "rgba(3,16,58)",
                                                              color: "white",
                                                          }}
                                                          id={rows.orderId}
                                                          value={rows.type}
                                                          token-address={
                                                              rows.tokenAddress
                                                          }
                                                          onClick={() =>
                                                              handleCancelOrder(
                                                                  0,
                                                                  rows.tokenA,
                                                                  rows.tokenB,
                                                                  rows.orderId
                                                              )
                                                          }
                                                      >
                                                          Cancel
                                                      </Button>
                                                  </TableCell>
                                              </TableRow>
                                          );
                                      })
                                : null}
                        </TableBody>
                        {buyRows ? (
                            buyRows.length === 0 ? (
                                <Typography sx={{ marginTop: "10px" }}>
                                    No Buy Orders Made Yet
                                </Typography>
                            ) : null
                        ) : null}
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={buyRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>
        );
    } else if (myOrderTypeSelected === 1) {
        return (
            <div>
                <TableContainer sx={{ maxHeight: 440, zIndex: "0" }}>
                    <Table stickyHeader sx={{ zIndex: "0" }}>
                        <TableHead sx={{ zIndex: "0" }}>
                            <TableRow>
                                {sellColumns.map((column) => (
                                    <TableCell
                                        sx={{
                                            color: "white",
                                            backgroundColor: "rgba(3,16,58)",
                                            zIndex: "0",
                                        }}
                                        key={column.id}
                                        align={column.align}
                                        style={{
                                            minWidth: column.minWidth,
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                                <TableCell
                                    sx={{
                                        color: "white",
                                        backgroundColor: "rgba(3,16,58)",
                                        zIndex: "0",
                                    }}
                                    key={"cancel"}
                                    align={"center"}
                                    style={{ minWidth: 130 }}
                                ></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sellRows
                                ? sellRows
                                      .slice(
                                          page * rowsPerPage,
                                          page * rowsPerPage + rowsPerPage
                                      )
                                      .map((rows) => {
                                          return (
                                              <TableRow
                                                  hover
                                                  role="checkbox"
                                                  key={rows.orderId}
                                              >
                                                  {sellColumns.map((column) => {
                                                      const value =
                                                          rows[column.id];
                                                      return (
                                                          <TableCell
                                                              sx={{
                                                                  color: "white",
                                                              }}
                                                              key={column.id}
                                                              align={
                                                                  column.align
                                                              }
                                                          >
                                                              {column.format &&
                                                              typeof value ===
                                                                  "number"
                                                                  ? column.format(
                                                                        value
                                                                    )
                                                                  : value}
                                                          </TableCell>
                                                      );
                                                  })}
                                                  <TableCell
                                                      sx={{
                                                          color: "white",
                                                      }}
                                                      key={"cancel"}
                                                      align={"center"}
                                                  >
                                                      <Button
                                                          variant="contained"
                                                          sx={{
                                                              backgroundColor:
                                                                  "rgba(3,16,58)",
                                                              color: "white",
                                                          }}
                                                          id={rows.orderId}
                                                          value={rows.type}
                                                          token-address={
                                                              rows.tokenAddress
                                                          }
                                                          onClick={() =>
                                                              handleCancelOrder(
                                                                  1,
                                                                  rows.tokenA,
                                                                  rows.tokenB,
                                                                  rows.orderId
                                                              )
                                                          }
                                                      >
                                                          Cancel
                                                      </Button>
                                                  </TableCell>
                                              </TableRow>
                                          );
                                      })
                                : null}
                        </TableBody>
                        {sellRows ? (
                            sellRows.length === 0 ? (
                                <Typography sx={{ marginTop: "10px" }}>
                                    No Sell Orders Made Yet
                                </Typography>
                            ) : null
                        ) : null}
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={sellRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>
        );
    } else {
        return (
            <div>
                <TableContainer sx={{ maxHeight: 440, zIndex: "0" }}>
                    <Table stickyHeader sx={{ zIndex: "0" }}>
                        <TableHead sx={{ zIndex: "0" }}>
                            <TableRow>
                                {filledColumns.map((column) => (
                                    <TableCell
                                        sx={{
                                            color: "white",
                                            backgroundColor: "rgba(3,16,58)",
                                            zIndex: "0",
                                        }}
                                        key={column.id}
                                        align={column.align}
                                        style={{
                                            minWidth: column.minWidth,
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filledRows
                                ? filledRows
                                      .slice(
                                          page * rowsPerPage,
                                          page * rowsPerPage + rowsPerPage
                                      )
                                      .map((rows) => {
                                          return (
                                              <TableRow
                                                  hover
                                                  role="checkbox"
                                                  key={rows.prices}
                                              >
                                                  {filledColumns.map(
                                                      (column) => {
                                                          const value =
                                                              rows[column.id];
                                                          return (
                                                              <TableCell
                                                                  sx={{
                                                                      color: "white",
                                                                  }}
                                                                  key={
                                                                      column.id
                                                                  }
                                                                  align={
                                                                      column.align
                                                                  }
                                                              >
                                                                  {column.format &&
                                                                  typeof value ===
                                                                      "number"
                                                                      ? column.format(
                                                                            value
                                                                        )
                                                                      : value}
                                                              </TableCell>
                                                          );
                                                      }
                                                  )}
                                              </TableRow>
                                          );
                                      })
                                : null}
                        </TableBody>
                        {filledRows ? (
                            filledRows.length === 0 ? (
                                <Typography sx={{ marginTop: "10px" }}>
                                    No Orders Filled Yet
                                </Typography>
                            ) : null
                        ) : null}
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={filledRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>
        );
    }
}
