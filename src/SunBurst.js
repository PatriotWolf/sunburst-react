import React from 'react';
import { isEqual } from 'lodash/lang';
import * as d3 from 'd3';
import * as utils from './utils';
/**
 * Sunburst Chart React Stateless Component with the following allowable Props *
 * data => JSON Array - Typically same for every Sunburst Chart *
 * scale => String - Options: linear | exponential - Linear renders each arc with same radii, Exponential reduces gradually by SquareRoot *
 * onSelect => Function - Called on Arc Click for re-rendering the chart and passing back to User as props *
 * tooltip => Boolean - Display Tooltip or not *
 * tooltipContent => HTMLNode - Customized Node for Tooltip rendering *
 * keyId => String - Unique Id for Chart SVG *
 * width => Integer - Width of the Chart Container *
 * height => Integer - Height of the Chart Container *
 */
class Sunburst extends React.Component {
  componentDidMount() {
    this.renderSunburst(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props, nextProps)) {
      this.renderSunburst(nextProps);
    }
  }
  arcTweenData(a, i, node, x, arc) {  // eslint-disable-line
    const oi = d3.interpolate({ x0: (a.x0s ? a.x0s : 0), x1: (a.x1s ? a.x1s : 0) }, a);
    function tween(t) {
      const b = oi(t);
      a.x0s = b.x0;   // eslint-disable-line
      a.x1s = b.x1;   // eslint-disable-line
      return arc(b);
    }
    if (i === 0) {
      const xd = d3.interpolate(x.domain(), [node.x0, node.x1]);
      return function (t) {
        x.domain(xd(t));
        return tween(t);
      };
    } else {  // eslint-disable-line
      return tween;
    }
  }
  update(root, firstBuild, svg, partition, hueDXScale, x, y, radius, arc, node, self) {  // eslint-disable-line
    if (firstBuild) {
      firstBuild = false; // eslint-disable-line
      function click(d) { 
        console.log(d.data)
      }
      const tooltipContent = self.props.tooltipContent;
      const tooltip = d3.select(`#${self.props.keyId}`)
        .append(tooltipContent ? tooltipContent.type : 'div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('opacity', '0');
      if (tooltipContent) {
        Object.keys(tooltipContent.props).forEach((key) => {
          tooltip.attr(key, tooltipContent.props[key]);
        });
      }
      svg.selectAll('path').data(partition(root).descendants()).enter().append('path')
      .style('fill', (d) => {
        const current = d;
        if (current.depth === 0) {
          return d3.color("white")
        }
        // if (current.depth <= 1) {
        //   current.fill = d3.color("green");
        // }
        // current.fill = current.parent.fill;
        // const hsl = d3.hsl(current.fill);
        // hue = hueDXScale(current.x0);
        // const colorshift = hsl.h + (hue / 4);
        return d3.color("#d3d3d3");
      })
      .attr('stroke', '#fff')
      .attr('id', '#section')
      .attr('stroke-width', '1')
      .on('click', d => click(d, node, svg, self, x, y, radius, arc))
      .on('mouseover', function (d) {
        if (self.props.tooltip) {
          d3.select(this).style('cursor', 'pointer');
          if(d.depth !== 0 ){
          d3.select(this).style('fill','#FF7F30')
          }
          // d3.select(this).color.brighter(0.5);
          tooltip.html(() => { const name = utils.formatNameTooltip(d); return name; });
          return tooltip.transition().duration(50).style('opacity', 1);
        }
        return null;
      })
      .on('mousemove', () => {
        if (self.props.tooltip) {
          tooltip
            .style('top', `${d3.event.pageY - 50}px`)
            .style('left', `${self.props.tooltipPosition === 'right' ? d3.event.pageX - 100 : d3.event.pageX - 50}px`);
        }
        return null;
      })
      .on('mouseout', function (d) {
        if (self.props.tooltip) {
          d3.select(this).style('cursor', 'default');
          if(d.depth !== 0 ){
          d3.select(this).style('fill','#d3d3d3')
          }
          // d3.select(this).color.brighter(0.5);

          tooltip.transition().duration(50).style('opacity', 0);
        }
        return null;
      })
      .append("text").style("font-size", "20px").style("width", "50").style("fill", "navy").append("textPath")
      .attr("xlink:href", "#s3")
      .text("Wavy text is the gimmick for many years to come (d3)");
    } else {
      svg.selectAll('path').data(partition(root).descendants());
    }
    svg.selectAll('path').transition().duration(1000).attrTween('d', (d, i) => self.arcTweenData(d, i, node, x, arc));
  }
  renderSunburst(props) {
    if (props.data) {
      const self = this, // eslint-disable-line
        gWidth = props.width,
        gHeight = props.height,
        radius = (Math.min(gWidth, gHeight) / 2) - 10,
        svg = d3.select('svg').append('g').attr('transform', `translate(${gWidth / 2},${gHeight / 2})`),
        x = d3.scaleLinear().range([0, 2 * Math.PI]),
        y = props.scale === 'linear' ? d3.scaleLinear().range([0, radius]) : d3.scaleSqrt().range([0, radius]),
        partition = d3.partition(),
        arc = d3.arc()
          .startAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x0))))
          .endAngle(d => Math.max(0, Math.min(2 * Math.PI, x(d.x1))))
          .innerRadius(d => Math.max(0, y(d.y0)))
          .outerRadius(d => Math.max(0, y(d.y1))),
        hueDXScale = d3.scaleLinear()
          .domain([0, 1])
          .range([0, 360]),
        rootData = d3.hierarchy(props.data);
      const firstBuild = true;
      const node = rootData;
      rootData.sum(d => d.size);
      self.update(rootData, firstBuild, svg, partition, hueDXScale, x, y, radius, arc, node, self); // GO!
    }
  }
  render() {
    return (
      <div id={this.props.keyId} className="text-center">
        <svg style={{ width: parseInt(this.props.width, 10) || 480, height: parseInt(this.props.height, 10) || 400 }} id={`${this.props.keyId}-svg`} />
      </div>
    );
  }
}

export default Sunburst;