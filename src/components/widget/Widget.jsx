import "./widget.scss";
import * as React from 'react';
import { useContext } from "react";
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BarChartIcon from '@mui/icons-material/BarChart';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import TourIcon from '@mui/icons-material/Tour';
import { DarkModeContext } from "../../context/darkModeContext";

const Widget = ({ type, value, name, tophealers, topdps, topkills, topkda }) => {
  const { darkMode } = useContext(DarkModeContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [topFive, setTopFive] = React.useState([]);

  let data;

  //temporary
  const amount = 100;
  const diff = 20;

  switch (type) {
    case "dmg":
      data = {
        title: "DAMAGE",
        isMoney: false,
        link: "See all users",
        value: parseInt(value, 10).toLocaleString('en-US'),
        name,
        icon: (
          <WhatshotIcon
            className="icon"
            style={{
              backgroundColor: "rgba(218, 165, 32, 0.2)",
              color: "goldenrod",
            }}
          />
        ),
      };
      break;
    case "heal":
      data = {
        title: "HEAL",
        isMoney: false,
        link: "View all orders",
        value: parseInt(value, 10).toLocaleString('en-US'),
        name,
        icon: (
          <HealthAndSafetyIcon
            className="icon"
            style={{ backgroundColor: "rgba(0, 128, 0, 0.2)", color: "green" }}
          />
        ),
      };
      break;
    case "kills":
      data = {
        title: "KILLS",
        isMoney: true,
        link: "View net earnings",
        value,
        name,
        icon: (
          <TourIcon
            className="icon"
            style={{
              color: "crimson",
              backgroundColor: "rgba(255, 0, 0, 0.2)",
            }}
          />
        ),
      };
      break;
    case "kda":
      data = {
        title: "KDA",
        isMoney: true,
        link: "See details",
        value: Math.round((value) * 10) / 10,
        name,
        icon: (
          <BarChartIcon
            className="icon"
            style={{
              backgroundColor: "rgba(128, 0, 128, 0.2)",
              color: "purple",
            }}
          />
        ),
      };
      break;
    default:
      break;
  }

  const handleClick = (event) => {
    switch (type) {
      case "dmg":
        setTopFive(topdps);
        break;
      case "heal":
        setTopFive(tophealers);
        break;
      case "kills":
        setTopFive(topkills);
        break;
      case "kda":
        setTopFive(topkda);
        break;
      default:
        break;
    }
    setAnchorEl(event.currentTarget);
  };

  const getValueByType = (player) => {
    switch (type) {
      case "dmg":
        return parseInt(player.damage, 10).toLocaleString('en-US');
      case "heal":
        return parseInt(player.heal, 10).toLocaleString('en-US');
      case "kills":
        return player.kill;
      case "kda":
        return Math.round(((parseInt(player.kill, 10) + (parseInt(player.assist, 10))) / getDeathNumber(parseInt(player.death, 10))) * 10) / 10 ;
      default:
        return '';
    }
  }

  const getDeathNumber = (death) => {
    return death === 0 ? 1 : death;
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="counter">
          {data.value}
        </span>
        <span className="link" style={{ cursor: 'pointer'}} aria-describedby={id} variant="contained" onClick={handleClick}>{"View top 5"}</span>
      </div>
      <div className="right">
        <div className="percentage positive" >
          {/* <KeyboardArrowUpIcon /> */}
          {data.name}
        </div>
        {data.icon}
        <Popover
          id={id}
          open={open}
          //style={{backgroundColor: 'black'}}
          // className={darkmode ? "dark-popover" : ""}
          classes={darkMode ? { paper: "MuiPopover-paper-dark" } : {}}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {topFive.map((player, idx) => {
            return <Typography style={{ padding: 4, paddingLeft: 8, paddingRight: 8 }} sx={{ p: 1 }}>{(idx+1) +'. ' + player.name + ' - ' + getValueByType(player)}</Typography>
          })}
        </Popover>
      </div>
    </div>
  );
};

export default Widget;
