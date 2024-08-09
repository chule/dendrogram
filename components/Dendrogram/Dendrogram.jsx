"use client";

import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";

const Dendrogram = ({ data, width, height }) => {
  const dendRef = useRef();

  useEffect(() => {
    function dendrogram(data, options = {}) {
      const {
        width: width = 420,
        height: height = 320,
        hideLabels: hideLabels = false,
        paddingBottom: paddingBottom = hideLabels ? 20 : 80,
        innerHeight = height - paddingBottom,
        innerWidth = width - 10,
        paddingLeft = 30,
        h: cutHeight = undefined,
        yLabel: yLabel = "↑ Height",
        colors: colors = d3.schemeTableau10,
        fontFamily: fontFamily = "Inter, sans-serif",
        linkColor: linkColor = "grey",
        fontSize: fontSize = 10,
        strokeWidth: strokeWidth = 1,
      } = options;

      d3.select(dendRef.current).selectAll("*").remove();

      const svg = d3
        .select(dendRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, innerHeight])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

      var clusterLayout = d3
        .cluster()
        .size([width - paddingLeft * 2, innerHeight]);

      const root = d3.hierarchy(data);
      const maxHeight = root.data.height;

      const yScaleLinear = d3
        .scaleLinear()
        .domain([0, maxHeight])
        .range([hideLabels ? innerHeight - 35 : innerHeight, 0]);

      const yAxisLinear = d3.axisLeft(yScaleLinear).tickSize(5);

      function transformY(data) {
        const height = hideLabels ? innerHeight - 15 : innerHeight;
        return height - (data.data.height / maxHeight) * height;
      }

      // traverse through first order children and assign colors
      if (cutHeight) {
        let curIndex = -1;
        root.each((child) => {
          if (
            child.data.height <= cutHeight &&
            child.data.height > 0 &&
            child.parent &&
            !child.parent.color
          ) {
            curIndex++;
            child.color = colors[curIndex];
          } else if (child.parent && child.parent.color) {
            child.color = child.parent.color;
          }
        });
      }

      clusterLayout(root);

      // y-axis
      svg
        .append("g")
        .attr("transform", `translate(0, ${hideLabels ? 20 : 0})`)
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${paddingLeft},${hideLabels ? 20 : 0})`)
        .call(yAxisLinear)
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .append("text")
            .attr("x", -paddingLeft)
            .attr("y", -20)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .style("font-family", fontFamily)
            .text(yLabel)
        )
        .selectAll(".tick")
        .classed("baseline", (d) => d == 0)
        .style("font-size", `${fontSize}px`)
        .style("font-family", fontFamily);

      // Links
      root.links().forEach((link) => {
        svg
          .append("path")
          .attr("class", "link")
          .attr("stroke", link.source.color || linkColor)
          .attr("stroke-width", `${strokeWidth}px`)
          .attr("fill", "none")
          .attr(
            "transform",
            `translate(${paddingLeft}, ${hideLabels ? 20 : 0})`
          )
          .attr("d", elbow(link));
      });

      // Nodes
      root.descendants().forEach((desc) => {
        // svg
        //   .append("circle")
        //   .classed("node", true)
        //   .attr("fill", desc.color)
        //   .attr("cx", desc.x)
        //   .attr("cy", transformY(desc))
        //   .attr("transform", `translate(${paddingLeft})`)
        //   .attr("r", 4);

        if (desc.data.isLeaf && !hideLabels) {
          svg
            .append("text")
            //.attr("x", desc.x)
            .attr("dx", -5)
            .attr("dy", 3)
            .attr("text-anchor", "end")
            .style("font-size", `${fontSize}px`)
            .style("font-family", fontFamily)
            .attr(
              "transform",
              `translate(${desc.x + paddingLeft},${transformY(
                desc
              )}) rotate(270)`
            )
            .text(desc.data.name || desc.data.index);
        }
      });

      // Custom path generator
      function elbow(d) {
        return (
          "M" +
          d.source.x +
          "," +
          transformY(d.source) +
          "H" +
          d.target.x +
          "V" +
          transformY(d.target)
        );
      }

      return svg.node();
    }

    dendrogram(data, { h: 2.5, width, height });
  }, [data, width, height]);

  return <div ref={dendRef}></div>;
};

export default Dendrogram;
