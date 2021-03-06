import React, { Component } from 'react';
import './icicle.css';
import * as d3 from "d3";

class Icicle extends Component {
  constructor(props) {
    super(props);
    this.state = {
        teachers_data: require('../../data/Teachers.json'),
        active_teacher: this.props.active_teacher
    }
  }

  componentDidMount() {
      this.drawIcicle();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.active_teacher !== prevState.active_teacher) {
      this.setState({ active_teacher: this.props.active_teacher });
      d3.select("#icicle").selectAll("*").remove();
      this.drawIcicle();
    }
  }

  filterData(teacherIdData) {
    let composedData = { name: teacherIdData.name, children:[] };
    let autumnSemester = { name: "Autumn", children: [] };
    let springSemester = { name: "Spring", children: [] }
    let foundHtPeriods = [];
    let foundVtPeriods = [];
    let i;
    for (i = 0; i < teacherIdData.ht_courses.length; i++) {
      if (teacherIdData.ht_courses[i].periods.toString() === [1,2].toString() || foundHtPeriods.toString() === [1,2].toString()) {
        foundHtPeriods = [1,2];
        break;
      } else if (!foundHtPeriods.includes(teacherIdData.ht_courses[i].periods[0])) {
        foundHtPeriods.push(teacherIdData.ht_courses[i].periods[0]);
        foundHtPeriods.sort();
      }
    }

    for (i = 0; i < teacherIdData.vt_courses.length; i++) {
      if (teacherIdData.vt_courses[i].periods.toString() === [3,4].toString() || foundVtPeriods.toString() === [3,4].toString()) {
        foundVtPeriods = [3,4];
        break;
      } else if (!foundVtPeriods.includes(teacherIdData.vt_courses[i].periods[0])) {
        foundVtPeriods.push(teacherIdData.vt_courses[i].periods[0]);
        foundVtPeriods.sort();
      } 
    }
    
    let foundPeriods = foundHtPeriods.concat(foundVtPeriods);
    

    let period1 = { name: "Period 1", children: [] };
    let period2 = { name: "Period 2", children: [] };
    let period3 = { name: "Period 3", children: [] };
    let period4 = { name: "Period 4", children: [] };

    for(i = 0; i < foundPeriods.length; i++) {

      if(foundPeriods[i] === 1 || foundPeriods[i] === 2) {
        let k;
        for (k = 0; k < teacherIdData.ht_courses.length; k++) {
          if(teacherIdData.ht_courses[k].periods.toString() === [1,2].toString() && foundPeriods[i] === 1) {
            period1.children.push({id: teacherIdData.ht_courses[k].course_id, code: teacherIdData.ht_courses[k].course_code, name: teacherIdData.ht_courses[k].course_name, value: teacherIdData.ht_courses[k].percentage/2});
            period2.children.push({id: teacherIdData.ht_courses[k].course_id, code: teacherIdData.ht_courses[k].course_code, name: teacherIdData.ht_courses[k].course_name, value: teacherIdData.ht_courses[k].percentage/2});
          } else if (teacherIdData.ht_courses[k].periods.toString() === [1].toString() && foundPeriods[i] === 1) {
            period1.children.push({id: teacherIdData.ht_courses[k].course_id, code: teacherIdData.ht_courses[k].course_code, name: teacherIdData.ht_courses[k].course_name, value: teacherIdData.ht_courses[k].percentage});
          } else if (teacherIdData.ht_courses[k].periods.toString() === [2].toString() && foundPeriods[i] === 2) {
            period2.children.push({id: teacherIdData.ht_courses[k].course_id, code: teacherIdData.ht_courses[k].course_code, name: teacherIdData.ht_courses[k].course_name, value: teacherIdData.ht_courses[k].percentage});
          }
        }
      }

      if(foundPeriods[i] === 3 || foundPeriods[i] === 4) {
        let k;
        for (k = 0; k < teacherIdData.vt_courses.length; k++) {
          if(teacherIdData.vt_courses[k].periods.toString() === [3,4].toString() && foundPeriods[i] === 3) {
            period3.children.push({id: teacherIdData.vt_courses[k].course_id, code: teacherIdData.vt_courses[k].course_code, name: teacherIdData.vt_courses[k].course_name, value: teacherIdData.vt_courses[k].percentage/2});
            period4.children.push({id: teacherIdData.vt_courses[k].course_id, code: teacherIdData.vt_courses[k].course_code, name: teacherIdData.vt_courses[k].course_name, value: teacherIdData.vt_courses[k].percentage/2});
          } else if (teacherIdData.vt_courses[k].periods.toString() === [3].toString() && foundPeriods[i] === 3) {
            period3.children.push({id: teacherIdData.vt_courses[k].course_id, code: teacherIdData.vt_courses[k].course_code, name: teacherIdData.vt_courses[k].course_name, value: teacherIdData.vt_courses[k].percentage});
          } else if (teacherIdData.vt_courses[k].periods.toString() === [4].toString() && foundPeriods[i] === 4) {
            period4.children.push({id: teacherIdData.vt_courses[k].course_id, code: teacherIdData.vt_courses[k].course_code, name: teacherIdData.vt_courses[k].course_name, value: teacherIdData.vt_courses[k].percentage});
          }
        }
      }

    }

    autumnSemester.children.push(period1, period2);
    springSemester.children.push(period3, period4);
    composedData.children.push(autumnSemester, springSemester);
    return composedData;
  }

  drawIcicle() {

    // Based on Mike Bostock's visualization on Observable: https://observablehq.com/@d3/zoomable-icicle

    var propfunction = this.props.courseIdUpdate;
    var clickFromOutside = this.props.courseClick;
    var teacherIdData = this.state.teachers_data[this.state.active_teacher-1];
    var data = this.filterData(teacherIdData);
    var width = 350;
    var height = 150;
    var color = d3.scaleOrdinal(['#E4A41A', '#3662F4']);

    const root = partition(data);
    var descendants = root.descendants();


    function hideRoot(){

      for (var i = 1; i < descendants.length; i++) {
        if (descendants[i].depth===1){
          descendants[i].y0-=root.y1;
          descendants[i].y1=width/3;
        }
        if (descendants[i].depth===2){
          descendants[i].y0=width/3;
          descendants[i].y1=2*width/3
        }

        if (descendants[i].depth===3){
          descendants[i].y0=2*width/3;
          descendants[i].y1=3*width/3;    }
      }
    }

    hideRoot();

    let focus = root;
  
    const svg = d3.select("#icicle")
        .append('svg')
        .attr("viewBox", [0, 0, width, height])
        //.attr('width', width),
        //.attr('height', height)
        .style("font-size", "10px ");

    const cell = svg
      .selectAll("g")
      .data(descendants)
      .join("g")
        .attr("transform", function(d){
          return "translate("+d.y0+","+d.x0+")";
        })

    const rect = cell.append("rect")
        .attr("width", function(d){
          if (d.depth===0) {
            return 0;
          }
          else return d.y1 - d.y0 - 1})
        .attr("style", function(d){
          if (d.depth===0){return "display:none"}
        })
        .attr("height", d => rectHeight(d))
        .attr("fill-opacity", 1.0)
        .attr("fill", d => {
          if (!d.depth) return "#aaaaaa";
          while (d.depth > 1) d = d.parent;
          return color(d.data.name);
        })
        .style("cursor", "pointer")
        .on("click", d => {
          if (d.depth === 3) {
            propfunction(d.data.id);
            clickFromOutside();
            //clicked(d);
          } else {
            clicked(d);
          }})
        .on("mouseover", function(d) {
          if(d.depth === 3) {
            tooltip
            .html(() => {
              if(d.depth === 3) {
                return "<b>Code:</b> " +d.data.code+"<br/>"+" <b>Name:</b> "+d.data.name+"<br/>"+" <b>Percentage:</b> "+d.data.value+"%<br/>";
              } 
            })
            .style("left",(d3.event.pageX) +"px")
            .style("top",(d3.event.pageY +20)+"px")
            .style("opacity",1.0)
          }
        })
        .on("mousemove", function(d) {
          tooltip
          .style("left", (d3.event.pageX+"px"))
          .style("top", (d3.event.pageY+30+"px"))
        })
        .on("mouseout", function(d) {
          tooltip.style("opacity", 0.0);
        });
  
    const text = cell.append("text")
        .style("user-select", "none")
        .attr("pointer-events", "none")
        .attr("x", 3)
        .attr("y", 9)
        .attr('fill', 'white')
        .attr("fill-opacity", d => +labelVisible(d)); // Dissappear text if text larger than rectangle.
  
    text.append("tspan")
        .text(d => {
          if(d.data.code !== undefined) {
            return d.data.code + " " + d.data.name;
          } else {
            return d.data.name;
          }
        });
  
    const tspan = text.append("tspan")
        .attr("fill-opacity", d => labelVisible(d) * 0.8)
        .text(d => ` ${parseFloat(d.value.toFixed(2)) + "%"}`);
  
    //cell.append("title").text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${parseFloat(d.value.toFixed(2))}`);

    var tooltip=d3.select("#icicle")
    .append("div")
    .attr("class","tooltip")
    .style("opacity",0.0);
  
    function clicked(p) {
      if (!p.depth) return;
      focus = focus === p ? p = p.parent : p; // If clicking at the leftmost rectangle, goes to parent.
  
      root.each(d => d.target = {
        x0: (d.x0 - p.x0) / (p.x1 - p.x0) * height,
        x1: (d.x1 - p.x0) / (p.x1 - p.x0) * height,
        y0: d.y0 - p.y0,
        y1: d.y1 - p.y0
      });
  
      const t = cell.transition().duration(750)
          .attr("transform", d => `translate(${d.target.y0},${d.target.x0})`);
  
      rect.transition(t).attr("height", d => rectHeight(d.target));
      text.transition(t).attr("fill-opacity", d => +labelVisible(d.target));
      tspan.transition(t).attr("fill-opacity", d => labelVisible(d.target) * 0.7);
    }
    
    function rectHeight(d) {
      return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
    }
  
    function labelVisible(d) {
      return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
    }

    function partition(data) {
      const root = d3.hierarchy(data)
          .sum(d => d.value)
          //.sort((a, b) => b.height - a.height || b.value - a.value); //biggest partition furthest up
      return d3.partition()
          .size([height, (root.height + 1) * width / 4])
        (root);
    }
    
    return svg.node();
  }


  render() {
    return (
      <div id="icicle">
      </div>
    );
  }

}

export default Icicle;