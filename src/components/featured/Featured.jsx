import "./featured.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Featured = (props) => {
  return (
    <div className="featured">
      <div className="top">
        <h1 className="title">Total Stats</h1>
        <MoreVertIcon fontSize="small" />
      </div>
      <div className="bottom">
        <p className="title">Win rate</p>
        <div className="featuredChart">
          <CircularProgressbar
            value={props.winPrecentage}
            text={props.winPrecentage + '%'}
            strokeWidth={5}
            styles={buildStyles({
          
              // Colors
              pathColor: 'green',
              textColor: 'green',
              // trailColor: '#d6d6d6',
              // backgroundColor: '#3e98c7',
            })}
          />
        </div>
        <p className="title">Total wars tracked</p>
        <p className="amount">{props.warcounter + "/200"}</p>
        <p className="desc">
          Previous datas processing. Last wars may not be included.
        </p>
        <div className="summary">
          <div className="item">
            <div className="itemTitle" style={{ color: 'goldenrod'}}>{'Total dmg: ' + parseInt(props.wardata.dmg, 10).toLocaleString('en-US')}</div>
          </div>
          <div className="item">
          <div className="itemTitle" style={{ color: 'green'}}>{'Total healing: ' + parseInt(props.wardata.heal, 10).toLocaleString('en-US')}</div>
          </div>
          <div className="item">
            <div className="itemTitle" style={{ color: 'crimson'}}>{'Total kills: ' + parseInt(props.wardata.kill, 10).toLocaleString('en-US')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
