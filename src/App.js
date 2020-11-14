import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import * as d3 from 'd3';
import _ from 'lodash'
import data from './data/data'
import { annotation, annotationLabel } from "d3-svg-annotation";


console.log(data)

const width = 1700;
const height = 300;
const margin = {left: 50, top: 50, right: 200, bottom:20};
const padding = 2;


const xScale = d3.scaleLinear().range([margin.left, width-margin.right]);

const colorScale = d3.scaleLinear().range(["#53cfd8","#f7d283","#e85151"]);




class App extends Component {

  constructor(props){
    super(props);
    this.state = {timlineData: [], xAxis: "",makeAnnotations:"",zoom: [],range:[]}
  }

  //The componentWillMount() lifecycle hook is primarily used to implement server-side logic before the actual rendering happens, such as making an API call to the server.
  componentWillMount(){

    const min = d3.min(data, d => d.startDate);
    const max = d3.max(data, d => d.endDate);
     xScale.domain([1865,2016]);
     colorScale.domain([1865,2016]);


    const timlineData = _.chain(data)
    .map(d =>{
      return{
        startDate:+d.startDate,
        endDate:(+d.startDate)+1,
        title: d.title,
        description: d.description,
        level: +d.level,
        x: xScale(+d.startDate),
        fill: colorScale(+d.startDate)
      }
    })
    .value();

    const annotationData = _.chain(data)
    .filter((d) => d.level == 1)
    .map((d,i) => {
      return {
        note: { title: d.title, align: "middle", orientation: "leftright" },
        x: xScale(+d.startDate),
        y: i%2==0?margin.top+((height-margin.top-margin.bottom)/2):margin.top,
        dx: 20,
        dy: 0
      };
    })
    .value();

    const xAxis = d3.axisBottom().scale(xScale).ticks(20).tickFormat(d=>d);
    const makeAnnotations = annotation().type(annotationLabel).annotations(annotationData);


    console.log(timlineData);
    this.setState({timlineData});
    this.setState({xAxis});
    this.setState({makeAnnotations});


  }

  componentDidMount(){
    this.container = d3.select(this.refs.container);
    d3.select(this.refs.xAxis).call(this.state.xAxis);
    d3.select(this.refs.annotations).call(this.state.makeAnnotations);

    this.brush = d3
     .brushX()
     .extent([
       [margin.left, margin.top],
       [width - margin.right, height - margin.bottom]
     ])
     .on("end", this.brushEnd);
     d3.select(this.refs.brush).call(this.brush);

    // console.log(this.refs.container, this.container)
    // this.renderTimeline();
  }

  componentDidUpdate() {

    d3.select(this.refs.bars)
      .selectAll("rect")
      .data(this.state.timlineData)
      .transition()
      .attr("fill", (d) => d.fill);

  }

  renderTimeline(){

  }

  updateRange = range => {
    this.setState({ range });
  };

  brushEnd = (event) => {
    if (!event.selection) {
      this.updateRange([]);
      this.updateBars();
      return;
    }

    const [x1, x2] = event.selection;

    const range = [xScale.invert(x1),xScale.invert(x2)];
    console.log(range);
    this.updateRange(range);
    this.updateBars();
  };

  updateBars = () =>{
    const timlineData = _.chain(this.state.timlineData)
    .map(d =>{
      const isColored =
          !this.state.range.length || (this.state.range[0] <= +d.startDate && +d.startDate <= this.state.range[1]);
      return{
        startDate:+d.startDate,
        endDate:(+d.startDate)+1,
        title: d.title,
        description: d.description,
        level: +d.level,
        x: xScale(+d.startDate),
        fill: isColored ? colorScale(+d.startDate) : "#ccc"
      }
    })
    .value();
    this.setState({ timlineData });
  }

  updateZoom = zoom => {
    this.setState({ zoom });
  };

  render(){
    return (
      <svg width={width} height={height} ref='container'>
        <g ref="bars">
        {this.state.timlineData.map((d, i) => (
          <rect
            key={i}
            x={d.x}
            y={margin.top}
            width={xScale(+d.endDate)-xScale(+d.startDate)-padding}
            height={height-margin.bottom-margin.top}
            fill={d.fill}
          />
        ))}
        </g>
        <g ref="xAxis" transform={`translate(0, ${height - margin.bottom})`}/>
        <g ref="yAxis" transform={`translate(${margin.left}, 0)`} />
        <g ref="annotations" />
        <g ref="brush" />
      </svg>
    )
  }
}

export default App;
