import "./war.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import Widget from "../../components/widget/Widget";
import { Bubble } from 'react-chartjs-2';
import React, { Component } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Papa from 'papaparse';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

let mostDmg = { name: '-', value: 0 };
let mostHeal = { name: '-', value: 0 };
let mostKill = { name: '-', value: 0 };
let mostKda = { name: '-', value: 0 };

export const options = {
  plugins: {
    title: {
      display: true,
      text: 'Damage/heal'
    },
    tooltip: {
      displayColors: false,
      enabled: true,
      intersect: false,
      mode: 'nearest',
      callbacks: {
        title: (val) => { return val[0].raw.name },
        label: (item) => {
          console.log('item,', item)
          return [
            'score: ' + item.raw.score,
            'damage: ' + parseInt(item.raw.damage, 10).toLocaleString('en-US'),
            'heal: ' + parseInt(item.raw.heal, 10).toLocaleString('en-US'),
            'kill: ' + item.raw.kill,
            'death: ' + item.raw.death,
            'assist: ' + item.raw.assist
          ]
        }
      },
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Healing',
        color: '#2fa159',
        font: {
          family: 'Times',
          size: 14,
          style: 'normal',
          lineHeight: 1.2
        },
        padding: { top: 30, left: 0, right: 0, bottom: 0 }
      }
    },
    x: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Damage',
        color: 'goldenrod',
        font: {
          family: 'Times',
          size: 14,
          style: 'normal',
          lineHeight: 1.2
        },
        padding: { top: 0, left: 0, right: 0, bottom: 0 }
      }
    },
  },
};

export const options2 = {
  plugins: {
    title: {
      display: true,
      text: 'Damage/kill'
    },
    tooltip: {
      displayColors: false,
      enabled: true,
      intersect: false,
      mode: 'nearest',
      callbacks: {
        title: (val) => { return val[0].raw.name },
        label: (item) => {
          console.log('item,', item)
          return [
            'score: ' + item.raw.score,
            'damage: ' + parseInt(item.raw.damage, 10).toLocaleString('en-US'),
            'heal: ' + parseInt(item.raw.heal, 10).toLocaleString('en-US'),
            'kill: ' + item.raw.kill,
            'death: ' + item.raw.death,
            'assist: ' + item.raw.assist
          ]
        }
      },
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Kill',
        color: 'red',
        font: {
          family: 'Times',
          size: 14,
          style: 'normal',
          lineHeight: 1.2
        },
        padding: { top: 30, left: 0, right: 0, bottom: 0 }
      }
    },
    x: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Damage',
        color: 'goldenrod',
        font: {
          family: 'Times',
          size: 14,
          style: 'normal',
          lineHeight: 1.2
        },
        padding: { top: 0, left: 0, right: 0, bottom: 0 }
      }
    },
  },
};

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


class War extends Component {
  state = {
    warData: {
      territory: '-',
      side: '-',
      date: '-',
      topDps: [],
      topHealers: [],
      topKills: [],
      topKda: [],
      overallDmg: 0,
      overallHeal: 0,
      overallKills: 0,
      overallDeaths: 0,
      result: '-',
      stats: []
    },
    graphData: null,
    graphData2: null,
    dataLoaded: false
  }

  componentDidMount() {
    console.log('warmount', this.props)
    if (this.props.params && this.props.params.warId) this.loadingData();
  }

  componentDidUpdate(prevProps) {
    console.log('warupdate', prevProps, this.props)
    /*if (prevProps.warcounter !== this.props.warcounter) {
      console.log('warcounter')
      if(this.props.warcounter) {
        this.loadingData();
      }
    }*/
  }

  loadingData = () => {
    const dbUrl = "https://docs.google.com/spreadsheets/d/1bzOEbAoDShhpKJW1XzD0ZNGbSJOrijQWgAkoTyHAwks/gviz/tq?tqx=out:csv&sheet=";
    Papa.parse(dbUrl + this.props.params.warId, {
      download: true,
      header: true,
      complete: (results) => {
        let overallDmg = 0;
        let overallHeal = 0;
        let overallKills = 0;
        let overallDeaths = 0;
        let newWardata = [...results.data];
        newWardata.shift();

        newWardata.forEach(player => {
          overallDmg += parseInt(player.damage, 10);
          overallHeal += parseInt(player.heal, 10);
          overallKills += parseInt(player.kill, 10);
          overallDeaths += parseInt(player.death, 10);
        });

        let warData = {
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
          overallDeaths,
          result: results.data[0].score == -1 ? 'Lose' : 'Win',
          stats: newWardata
        }

        console.log('warData', warData, this.getGroupsByNumber(2))
        this.setState({ warData }, () => {
          //console.log('warData2', warData, this.getGroupsByNumber(2))
          this.setState({
            graphData: {
              datasets: [
                {
                  label: 'Group 1',
                  data: this.getGroupsByNumber(1),
                  backgroundColor: '#9e0142',
                },
                {
                  label: 'Group 2',
                  data: this.getGroupsByNumber(2),
                  backgroundColor: '#d53e4f',
                },
                {
                  label: 'Group 3',
                  data: this.getGroupsByNumber(3),
                  backgroundColor: '#f46d43',
                },
                {
                  label: 'Group 4',
                  data: this.getGroupsByNumber(4),
                  backgroundColor: '#fdae61',
                },
                {
                  label: 'Group 5',
                  data: this.getGroupsByNumber(5),
                  backgroundColor: '#fee08b',
                },
                {
                  label: 'Group 6',
                  data: this.getGroupsByNumber(6),
                  backgroundColor: '#e6f598',
                },
                {
                  label: 'Group 7',
                  data: this.getGroupsByNumber(7),
                  backgroundColor: '#abdda4',
                },
                {
                  label: 'Group 8',
                  data: this.getGroupsByNumber(8),
                  backgroundColor: '#66c2a5',
                },
                {
                  label: 'Group 9',
                  data: this.getGroupsByNumber(9),
                  backgroundColor: '#3288bd',
                },
                {
                  label: 'Group 10',
                  data: this.getGroupsByNumber(10),
                  backgroundColor: '#5e4fa2',
                }
              ],
            },
            graphData2: {
              datasets: [
                {
                  label: 'Group 1',
                  data: this.getGroupsByNumber(1, true),
                  backgroundColor: '#9e0142',
                },
                {
                  label: 'Group 2',
                  data: this.getGroupsByNumber(2, true),
                  backgroundColor: '#d53e4f',
                },
                {
                  label: 'Group 3',
                  data: this.getGroupsByNumber(3, true),
                  backgroundColor: '#f46d43',
                },
                {
                  label: 'Group 4',
                  data: this.getGroupsByNumber(4, true),
                  backgroundColor: '#fdae61',
                },
                {
                  label: 'Group 5',
                  data: this.getGroupsByNumber(5, true),
                  backgroundColor: '#fee08b',
                },
                {
                  label: 'Group 6',
                  data: this.getGroupsByNumber(6, true),
                  backgroundColor: '#e6f598',
                },
                {
                  label: 'Group 7',
                  data: this.getGroupsByNumber(7, true),
                  backgroundColor: '#abdda4',
                },
                {
                  label: 'Group 8',
                  data: this.getGroupsByNumber(8, true),
                  backgroundColor: '#66c2a5',
                },
                {
                  label: 'Group 9',
                  data: this.getGroupsByNumber(9, true),
                  backgroundColor: '#3288bd',
                },
                {
                  label: 'Group 10',
                  data: this.getGroupsByNumber(10, true),
                  backgroundColor: '#5e4fa2',
                }
              ],
            }
          })
        });
      }
    });
  }

  getWinPercentage = () => {
    return Math.round((this.state.wins / this.props.warcounter) * 100)
  }

  pickGreatestHealer = (arr = [], num = 1) => {
    if (num > arr.length) {
      return [];
    };
    const sorter = (a, b) => parseInt(b.heal, 10) - parseInt(a.heal, 10);
    const descendingCopy = arr.slice().sort(sorter);
    return descendingCopy.splice(0, num);
  };

  pickGreatestDps = (arr = [], num = 1) => {
    if (num > arr.length) {
      return [];
    };
    const sorter = (a, b) => parseInt(b.damage, 10) - parseInt(a.damage, 10);
    const descendingCopy = arr.slice().sort(sorter);
    return descendingCopy.splice(0, num);
  };

  pickGreatestKill = (arr = [], num = 1) => {
    if (num > arr.length) {
      return [];
    };
    const sorter = (a, b) => parseInt(b.kill, 10) - parseInt(a.kill, 10);
    const descendingCopy = arr.slice().sort(sorter);
    return descendingCopy.splice(0, num);
  };

  pickGreatestKda = (arr = [], num = 1) => {
    if (num > arr.length) {
      return [];
    };
    const sorter = (a, b) => ((parseInt(b.kill, 10) + (parseInt(b.assist, 10))) / this.getDeathNumber(parseInt(b.death, 10))) - ((parseInt(a.kill, 10) + (parseInt(a.assist, 10))) / this.getDeathNumber(parseInt(a.death, 10)));
    const descendingCopy = arr.slice().sort(sorter);
    return descendingCopy.splice(0, num);
  };


  getLastDmgLeader = () => {
    let warData = JSON.parse(JSON.stringify(this.state.warData));
    warData.stats.forEach((player) => {
      if (parseInt(player.damage, 10) > parseInt(mostDmg.value, 10)) {
        mostDmg.name = player.name;
        mostDmg.value = player.damage;
      }
    })
    return mostDmg;
  };

  getLastHealLeader = () => {
    let warData = JSON.parse(JSON.stringify(this.state.warData));
    warData.stats.forEach((player) => {
      if (parseInt(player.heal, 10) > parseInt(mostHeal.value, 10)) {
        mostHeal.name = player.name;
        mostHeal.value = player.heal;
      }
    })
    return mostHeal;
  };

  getLastKillLeader = () => {
    let warData = JSON.parse(JSON.stringify(this.state.warData));
    warData.stats.forEach((player) => {
      if (parseInt(player.kill, 10) > parseInt(mostKill.value, 10)) {
        mostKill.name = player.name;
        mostKill.value = player.kill;
      }
    })
    return mostKill;
  };

  getDeathNumber = (death) => {
    return death === 0 ? 1 : death;
  }

  getLastKdaLeader = () => {
    let warData = JSON.parse(JSON.stringify(this.state.warData));
    warData.stats.forEach((player) => {
      if (((parseInt(player.kill, 10) + (parseInt(player.assist, 10))) / this.getDeathNumber(parseInt(player.death, 10))) > parseInt(mostKda.value, 10)) {
        mostKda.name = player.name;
        mostKda.value = ((parseInt(player.kill, 10) + (parseInt(player.assist, 10))) / this.getDeathNumber(parseInt(player.death, 10)));
      }
    })
    return mostKda;
  };

  getLastWarDatas = () => {
    let warData = JSON.parse(JSON.stringify(this.state.warData));
    let overall = { dmg: 0, heal: 0, kill: 0 }
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
    const sliced = warData.reverse().slice(0, 5).reverse();
    return sliced;
  }

  getGroupsByNumber = (groupNumber, kills) => {
    let result = [];
    let data = JSON.parse(JSON.stringify(this.state.warData.stats));
    console.log('data', data, groupNumber, kills)
    data.forEach(player => {
      if (player.group == groupNumber) {
        console.log('y', kills ? player.kill : player.heal)
        result.push({
          x: player.damage,
          y: kills ? player.kill : player.heal,
          r: 5,
          name: player.name,
          score: player.score,
          damage: player.damage,
          heal: player.heal,
          kill: player.kill,
          death: player.death,
          assist: player.assist
        });
      }
    });
    return result;
  }

  render() {
    return (
      <div className="single">
        <Sidebar />
        <div className="singleContainer">
          <Navbar />
          <div className="top">
            <div className="left">
              <h1 className="title">War information</h1>
              <div className="item">
                <div className="details">
                  <h1 className="itemTitle">{this.state.warData.territory + ' ' + this.state.warData.side}</h1>
                  <div className="detailItem">
                    <span className="itemKey">Date:</span>
                    <span className="itemValue">{this.state.warData.date}</span>
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Result:</span>
                    <span className="itemValue">{this.state.warData.result}</span>
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Total damage:</span>
                    <span className="itemValue">
                      {parseInt(this.state.warData.overallDmg, 10).toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Total healing:</span>
                    <span className="itemValue">
                      {parseInt(this.state.warData.overallHeal, 10).toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Total kills:</span>
                    <span className="itemValue">
                      {this.state.warData.overallKills}
                    </span>
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Total deaths:</span>
                    <span className="itemValue">
                      {this.state.warData.overallDeaths}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="right">
              {this.state.graphData && <Bubble options={options} data={this.state.graphData} updateMode="resize" />}
            </div>
          </div>
          <div className="widgets">
              <Widget type="dmg" value={this.getLastDmgLeader().value} name={this.getLastDmgLeader().name} topdps={this.state.warData.topDps} darkMode={false} />
              <Widget type="heal" value={this.getLastHealLeader().value} name={this.getLastHealLeader().name} tophealers={this.state.warData.topHealers} darkMode={false} />
              <Widget type="kills" value={this.getLastKillLeader().value} name={this.getLastKillLeader().name} topkills={this.state.warData.topKills} darkMode={false} />
              <Widget type="kda" value={this.getLastKdaLeader().value} name={this.getLastKdaLeader().name} topkda={this.state.warData.topKda} darkMode={false} />
          </div>
          <div className="top">
          <div className="bottom">
            <h1 className="title">Damage/kill efficiency</h1>
            {this.state.graphData2 && <Bubble options={options2} data={this.state.graphData2} updateMode="resize" />}
          </div>
          <div className="bottom">
            <h1 className="title">Damage/kill efficiency</h1>
            {this.state.graphData2 && <Bubble options={options2} data={this.state.graphData2} updateMode="resize" />}
          </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(War);
