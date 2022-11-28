import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./home.scss";
import Widget from "../../components/widget/Widget";
import Featured from "../../components/featured/Featured";
import Chart from "../../components/chart/Chart";
import Table from "../../components/table/Table";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import React, { Component } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Papa from 'papaparse';
import { RampRightSharp } from "@mui/icons-material";

let mostDmg = {name: '-', value: 0};
let mostHeal = {name: '-', value: 0};
let mostKill = {name: '-', value: 0};
let mostKda = {name: '-', value: 0};

function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    return (
      <Component
        {...props}
        location={location}
        params={params}
        navigate={navigate}
      />
    );
  }

  return ComponentWithRouterProp;
}

class Home extends Component {
  state = {
    wars: [],
    wins: 0,
    warsLoaded: -1,
    lastSix: [],
    dataLoaded: false
  }

  componentDidMount() {
    console.log('homeprops1', this.props)
    if(this.props.warcounter && this.props.warcounter > 0) this.loadingData();
  }

  componentDidUpdate(prevProps) {
    console.log('homeprops', prevProps, this.props)
    if (prevProps.warcounter !== this.props.warcounter) {
      console.log('warcounter')
      if(this.props.warcounter) {
        this.loadingData();
      }
    }
  }

  loadingData = () => {
    this.setState({ warsLoaded: 0 });
    let emptyWars = new Array(this.props.warcounter);
    console.log('emptyWars', emptyWars);
    for (let i = 0; i < emptyWars.length; i++) {
      emptyWars[i] = {id: i+1, territory: '', date: '', side: '', result: '', overallDmg: 0, overallHeal: 0, overallKills: 0, stats: []};
    }
    console.log('emptyWars', emptyWars, this.props.warcounter)
    this.setState({ wars: emptyWars}, () => {
      for (let i = 0; i < emptyWars.length; i++) {
        console.log('i', i)
        const dbUrl = "https://docs.google.com/spreadsheets/d/1bzOEbAoDShhpKJW1XzD0ZNGbSJOrijQWgAkoTyHAwks/gviz/tq?tqx=out:csv&sheet=";
        Papa.parse(dbUrl + (i+1), {
          download: true,
          header: true,
          complete: (results) => {
            let overallDmg = 0;
            let overallHeal = 0;
            let overallKills = 0;
            let newWardata = [...results.data];
            newWardata.shift();

            newWardata.forEach(player => {
              overallDmg += parseInt(player.damage, 10);
              overallHeal += parseInt(player.heal, 10);
              overallKills += parseInt(player.kill, 10);
            });

            let warData = {
              id: i+1,
              territory: results.data[0].name,
              side: results.data[0].group == -1 ? 'Defense' : 'Attack',
              date: results.data[0].type,
              topDps: this.pickGreatestDps(newWardata, 5),
              topHealers: this.pickGreatestHealer(newWardata, 5),
              topKills: this.pickGreatestKill(newWardata, 5),
              topKda: this.pickGreatestKda(newWardata, 5),
              overallDmg,
              overallHeal,
              overallKills,
              result: results.data[0].score == -1 ? 'Lose' : 'Win',
              stats: newWardata
            }

            console.log('warData', warData)
            let wars = JSON.parse(JSON.stringify(this.state.wars));
            wars[i] = warData;

            this.setState({ wars }, () => {
              this.setState((prevState) => ({
                warsLoaded: prevState.warsLoaded + 1
              })); 
              if(warData.result === 'Win') {
                this.setState((prevState) => ({
                  wins: prevState.wins + 1
                })); 
              }
            })
          }
        });
      }
    });
  }

  getWinPercentage = () => {
    return Math.round((this.state.wins / this.props.warcounter) * 100)
  }

  pickGreatestHealer = (arr = [], num = 1) => {
    if(num > arr.length){
       return [];
    };
    const sorter = (a, b) => parseInt(b.heal,10) - parseInt(a.heal,10);
    const descendingCopy = arr.slice().sort(sorter);
    return descendingCopy.splice(0, num);
 };

  pickGreatestDps = (arr = [], num = 1) => {
    if(num > arr.length){
      return [];
    };
    const sorter = (a, b) => parseInt(b.damage,10) - parseInt(a.damage,10);
    const descendingCopy = arr.slice().sort(sorter);
    return descendingCopy.splice(0, num);
  };

  pickGreatestKill = (arr = [], num = 1) => {
    if(num > arr.length){
      return [];
    };
    const sorter = (a, b) => parseInt(b.kill,10) - parseInt(a.kill,10);
    const descendingCopy = arr.slice().sort(sorter);
    return descendingCopy.splice(0, num);
  };

  pickGreatestKda = (arr = [], num = 1) => {
    if(num > arr.length){
      return [];
    };
    const sorter = (a, b) => ((parseInt(b.kill, 10) + (parseInt(b.assist, 10))) / this.getDeathNumber(parseInt(b.death, 10))) - ((parseInt(a.kill, 10) + (parseInt(a.assist, 10))) / this.getDeathNumber(parseInt(a.death, 10)));
    const descendingCopy = arr.slice().sort(sorter);
    return descendingCopy.splice(0, num);
  };


  getLastDmgLeader = () => {
    let warData = JSON.parse(JSON.stringify(this.state.wars));
    warData.forEach(wars => {
      if(wars.id == this.props.warcounter) {
        wars.stats.forEach((player) => {
          if(parseInt(player.damage, 10) > parseInt(mostDmg.value, 10)) {
            mostDmg.name = player.name;
            mostDmg.value = player.damage;
          }
        })
      }
    });
    return mostDmg;
  };

  getLastHealLeader = () => {
    let warData = JSON.parse(JSON.stringify(this.state.wars));
    warData.forEach(wars => {
      if(wars.id == this.props.warcounter) {
        wars.stats.forEach((player) => {
          if(parseInt(player.heal, 10) > parseInt(mostHeal.value, 10)) {
            mostHeal.name = player.name;
            mostHeal.value = player.heal;
          }
        })
      }
    });
    return mostHeal;
  };

  getLastKillLeader = () => {
    let warData = JSON.parse(JSON.stringify(this.state.wars));
    warData.forEach(wars => {
      if(wars.id == this.props.warcounter) {
        wars.stats.forEach((player) => {
          if(parseInt(player.kill, 10) > parseInt(mostKill.value, 10)) {
            mostKill.name = player.name;
            mostKill.value = player.kill;
          }
        })
      }
    });
    return mostKill;
  };

  getDeathNumber = (death) => {
    return death === 0 ? 1 : death;
  }

  getLastKdaLeader = () => {
    let warData = JSON.parse(JSON.stringify(this.state.wars));
    warData.forEach(wars => {
      if(wars.id == this.props.warcounter) {
        wars.stats.forEach((player) => {
          if(((parseInt(player.kill, 10) + (parseInt(player.assist, 10))) / this.getDeathNumber(parseInt(player.death, 10))) > parseInt(mostKda.value, 10)) {
            mostKda.name = player.name;
            mostKda.value = ((parseInt(player.kill, 10) + (parseInt(player.assist, 10))) / this.getDeathNumber(parseInt(player.death, 10)));
          }
        })
      }
    });
    return mostKda;
  };

  getLastWarDatas = () => {
    let warData = JSON.parse(JSON.stringify(this.state.wars));
    let overall = { dmg: 0, heal: 0, kill: 0}
    warData.forEach(war => {
      console.log('ward', war)
      overall.dmg += war.overallDmg;
      overall.heal += war.overallHeal;
      overall.kill += war.overallKills;
    });
    return overall;
  };

  getLastSixData = () => {
    let warData = JSON.parse(JSON.stringify(this.state.wars));
    const sliced = warData.reverse().slice(0,5).reverse();
    return sliced;
  }

  render() {
    return (
      <div className="home">
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={this.state.warsLoaded != this.props.warcounter}
        // onClick={handleClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
        <Sidebar />
        <div className="homeContainer">
          <Navbar />
          <div className="homeTitle">
            Last war leaders
          </div>
          <div className="widgets">
            <Widget type="dmg" value={this.getLastDmgLeader().value} name={this.getLastDmgLeader().name} topdps={this.state.wars[this.props.warcounter-1] && this.state.wars[this.props.warcounter-1].topDps} darkMode={this.props.darkMode} />
            <Widget type="heal" value={this.getLastHealLeader().value} name={this.getLastHealLeader().name} tophealers={this.state.wars[this.props.warcounter-1] && this.state.wars[this.props.warcounter-1].topHealers} />
            <Widget type="kills" value={this.getLastKillLeader().value} name={this.getLastKillLeader().name} topkills={this.state.wars[this.props.warcounter-1] && this.state.wars[this.props.warcounter-1].topKills} />
            <Widget type="kda" value={this.getLastKdaLeader().value} name={this.getLastKdaLeader().name} topkda={this.state.wars[this.props.warcounter-1] && this.state.wars[this.props.warcounter-1].topKda} />
          </div>
          <div className="charts">
            <Featured warcounter={this.props.warcounter} winPrecentage={this.getWinPercentage()} wardata={this.getLastWarDatas()} />
            <Chart title="Last 6 wars average damage / heal" aspect={2 / 1} data={this.getLastSixData()} />
          </div>
          <div className="listContainer">
            <div className="listTitle">Last 6 wars stats</div>
            <Table data={this.getLastSixData().reverse()} />
          </div>
        </div>
      </div>
    );
  }
};

export default withRouter(Home);

