import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import BarChart from './dummyChartBar';
import * as d3 from "d3";
import Sunburst from './SunBurst';
import data from './data';

class App extends Component {
  state = {
    data: null
  }
  componentDidMount() {
    d3.json("https://raw.githubusercontent.com/d3/d3-hierarchy/v1.1.8/test/data/flare.json").then(data =>{
      console.log(data)
      this.setState({
        data
      })}
    );
  }
  render() {
    console.log(data)
    return (
      <div className="App">
      <h1>SunBurst chart</h1>
        { data ? <Sunburst
          data={data}
          scale="exponential"
          tooltipContent={ <div class="sunburstTooltip" style="position:absolute; color:'black'; z-index:10; background: #e2e2e2; padding: 5px; text-align: center;" /> }
          tooltip
          tooltipPosition="right"
          keyId="anagraph"
          width="480"
          height="400" />: "null"
        }
      </div>
    );
  }
}

export default App;
