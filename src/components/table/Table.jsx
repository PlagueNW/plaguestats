import "./table.scss";
import { Link } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import ShieldIcon from '@mui/icons-material/Shield';

const List = ({ data }) => {
  return (
    <TableContainer component={Paper} className="table">
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell className="tableCell">Territory</TableCell>
            <TableCell className="tableCell">Side</TableCell>
            <TableCell className="tableCell">Date</TableCell>
            <TableCell className="tableCell">Total Damage</TableCell>
            <TableCell className="tableCell">Total Heal</TableCell>
            <TableCell className="tableCell">Dmg/Heal ratio</TableCell>
            <TableCell className="tableCell">Status</TableCell>
            <TableCell className="tableCell">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="tableCell">{row.territory}</TableCell>
              <TableCell className="tableCell">{row.side}</TableCell>
              <TableCell className="tableCell">{row.date}</TableCell>
              <TableCell className="tableCell">{parseInt(row.overallDmg, 10).toLocaleString('en-US')}</TableCell>
              <TableCell className="tableCell">{parseInt(row.overallHeal, 10).toLocaleString('en-US')}</TableCell>
              <TableCell className="tableCell">
                {(Math.round(parseInt(row.overallDmg, 10) / (parseInt(row.overallHeal, 10) + parseInt(row.overallDmg, 10)) * 100))
                + '/'
                + (100-(Math.round(parseInt(row.overallDmg, 10) / (parseInt(row.overallHeal, 10) + parseInt(row.overallDmg, 10)) * 100)))}
              </TableCell>
              <TableCell className="tableCell">
                <span className={`status ${row.result}`}>{row.result}</span>
              </TableCell>
              <TableCell className="tableCell">
                <div className="cellAction">
                  <Link to={"/wars/" + row.id} style={{ textDecoration: "none" }}>
                    <div className="viewButton">View</div>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default List;
