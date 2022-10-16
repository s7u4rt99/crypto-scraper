import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { visuallyHidden } from "@mui/utils";
import Toolbar from "@mui/material/Toolbar";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] == "-") {
    return 1;
  } else if (a[orderBy] == "-") {
    return -1;
  }

  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "id",
    numeric: false,
    disablePadding: false,
    label: "ID",
  },
  {
    id: "coin",
    numeric: false,
    disablePadding: false,
    label: "Coin",
  },
  {
    id: "date",
    numeric: false,
    disablePadding: false,
    label: "Date",
  },
  {
    id: "open",
    numeric: false,
    disablePadding: false,
    label: "Open ($)",
  },
  {
    id: "high",
    numeric: false,
    disablePadding: false,
    label: "High ($)",
  },
  {
    id: "low",
    numeric: false,
    disablePadding: false,
    label: "Low ($)",
  },
  {
    id: "close",
    numeric: false,
    disablePadding: false,
    label: "Close ($)",
  },
  {
    id: "volume",
    numeric: false,
    disablePadding: false,
    label: "Volume",
  },
];

function toGMT8(utc_string) {
  let date = new Date(utc_string);
  date.setTime(date.getTime() + 8 * 60 * 60 * 1000);
  const correctTime = date.toUTCString();
  return correctTime.split("GMT")[0];
}

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.id == "id" ? "left" : "right"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function EnhancedTable(props) {
  const { data } = props;

  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("id");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  return (
    <Paper sx={{ width: "100%", mb: 2 }}>
      <TableContainer>
        <Table
          sx={{ minWidth: "60vw" }}
          aria-labelledby="tableTitle"
          size={"small"}
        >
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            rowCount={data.length}
            sx={{ minWidth: "60vw" }}
          />
          <TableBody sx={{ minWidth: "60vw" }}>
            {stableSort(data, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;
                return (
                  <CoinRow
                    key={row.id}
                    coin={row}
                    labelId={labelId}
                    sx={{ minWidth: "60vw" }}
                  />
                );
              })}
            {emptyRows > 0 && (
              <TableRow
                style={{
                  height: 33 * emptyRows,
                }}
              >
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

const EnhancedTableToolbar = (props) => {
  const { amountRedeemed, totalAmount } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      <Typography
        sx={{ flex: "1 1 100%" }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        {`Amount Redeemed: ${amountRedeemed}/${totalAmount}`}
      </Typography>
    </Toolbar>
  );
};

function CoinRow(props) {
  const { coin, labelId } = props;

  return (
    <React.Fragment>
      <TableRow hover tabIndex={-1} key={coin.id}>
        <TableCell component="th" align="left" id={labelId} scope="row">
          {coin.id}
        </TableCell>
        <TableCell align="right">{coin.coin}</TableCell>
        <TableCell align="right">{coin.date}</TableCell>
        <TableCell align="right">{coin.open}</TableCell>
        <TableCell align="right">{coin.high}</TableCell>
        <TableCell align="right">{coin.low}</TableCell>
        <TableCell align="right">{coin.close}</TableCell>
        <TableCell align="right">{coin.volume}</TableCell>
      </TableRow>
    </React.Fragment>
  );
}
