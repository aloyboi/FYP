import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
    SET_ROWS_BUY_GLOBALORDER,
    SET_ROWS_SELL_GLOBALORDER,
} from "../../redux/redux-actions/actions";
import { overflow, overflowY } from "styled-system";

export default function StickyHeadTable(props) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const dispatch = useDispatch();
    const globalBuyOrders = useSelector(
        (state) => state.orders.rows_buy_globalOrders
    );
    const globalSellOrders = useSelector(
        (state) => state.orders.rows_sell_globalOrders
    );
    const refToken = useSelector((state) => state.token.curr_ref_token);
    const againstToken = useSelector((state) => state.token.curr_against_token);
    const allToken = useSelector((state) => state.token.all_tokens);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const columns = [
        {
            id: "amountA",
            label: props.type === 0 ? "Buy Amount " : "Sell Amount",
            minWidth: 300,
            align: "center",
            format: (value) => value.toString(),
        },
        {
            id: "rate",
            label: "Rate",
            minWidth: 300,
            align: "center",
            format: (value) => value.toString(),
        },
        {
            id: "amountB",
            label: props.type === 0 ? "Sell Amount " : "Buy Amount",
            minWidth: 300,
            align: "center",
            format: (value) => value.toString(),
        },
    ];

    if (props.type === 0 && refToken != null && againstToken != null) {
        return (
            <div>
                <TableContainer sx={{ maxHeight: 440, zIndex: "0" }}>
                    <Table stickyHeader sx={{ zIndex: "0" }}>
                        <TableHead sx={{ zIndex: "0" }}>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        sx={{
                                            color: "white",
                                            backgroundColor: "rgba(3,16,58)",
                                            zIndex: "0",
                                        }}
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {globalBuyOrders
                                ? globalBuyOrders
                                      .slice(
                                          page * rowsPerPage,
                                          page * rowsPerPage + rowsPerPage
                                      )
                                      .map((rows) => {
                                          console.log(
                                              rows,
                                              "finally",
                                              props.orderType,
                                              props.type
                                          );
                                          return (
                                              <TableRow
                                                  hover
                                                  role="checkbox"
                                                  tabIndex={-1}
                                                  key={rows.prices}
                                              >
                                                  {columns.map((column) => {
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
                                              </TableRow>
                                          );
                                      })
                                : null}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={globalBuyOrders.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>
        );
    } else if (props.type === 1 && refToken != null && againstToken != null) {
        return (
            <div>
                <TableContainer sx={{ maxHeight: 440, zIndex: "0" }}>
                    <Table stickyHeader sx={{ zIndex: "0" }}>
                        <TableHead sx={{ zIndex: "0" }}>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        sx={{
                                            color: "white",
                                            backgroundColor: "rgba(3,16,58)",
                                            zIndex: "0",
                                        }}
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {globalSellOrders
                                ? globalSellOrders
                                      .slice(
                                          page * rowsPerPage,
                                          page * rowsPerPage + rowsPerPage
                                      )
                                      .map((rows) => {
                                          console.log(rows, "finally");
                                          return (
                                              <TableRow
                                                  hover
                                                  role="checkbox"
                                                  tabIndex={-1}
                                                  key={rows.prices}
                                              >
                                                  {columns.map((column) => {
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
                                              </TableRow>
                                          );
                                      })
                                : null}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={globalSellOrders.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </div>
        );
    }
}
