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

    const handleCancelOrder = (event) => {
        displayTempMessage("Cancelling Order");
        cancelOrder(
            event.target.getAttribute("tokenA"),
            event.target.getAttribute("tokenB"),
            event.target.id,
            event.target.value,
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
            id: "id",
            label: "Order ID",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "tokenNameA",
            label: "Buy Token",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "tokenNameB",
            label: "Sell Token",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "amount",
            label: "Amount Remaining",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "originalAmount",
            label: "Amount Original",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },

        {
            id: "rate",
            label: "Rate",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "waivefees",
            label: "Opt Waive Fees",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
    ];

    const sellColumns = [
        {
            id: "id",
            label: "Order ID",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "tokenNameA",
            label: "Sell Token",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "tokenNameB",
            label: "Buy Token",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "amount",
            label: "Amount Remaining",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "originalAmount",
            label: "Amount Original",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },

        {
            id: "rate",
            label: "Rate",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "waivefees",
            label: "Opt Waive Fees",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
    ];

    const filledColumns = [
        {
            id: "id",
            label: "From Order ID",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "type",
            label: "Order Type",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "tokenNameA",
            label: "For Token",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "tokenNameB",
            label: "Against Token",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "amountFilled",
            label: "Amount Filled",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "fillRate",
            label: "Rate filled",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "originalRate",
            label: "Original Rate",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "waivefees",
            label: "Opt Waive Fees",
            minWidth: 130,
            align: "right",
            format: (value) => value.toLocaleString("en-US"),
        },
        {
            id: "fees",
            label: "Fees paid (USD)",
            minWidth: 130,
            align: "right",
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
                                    align={"right"}
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
                                                  tabIndex={-1}
                                                  key={rows.prices}
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
                                                      align={"right"}
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
                                                          onClick={
                                                              handleCancelOrder
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
                                    No Orders Made Yet
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
                                    align={"right"}
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
                                                  tabIndex={-1}
                                                  key={rows.prices}
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
                                                      align={"right"}
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
                                                          onClick={
                                                              handleCancelOrder
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
                                    No Orders Made Yet
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
                                                  tabIndex={-1}
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
                                    No Orders Made Yet
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
