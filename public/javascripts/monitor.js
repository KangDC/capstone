/*global $:false */
/*global _:false */
/*jslint browser:true */


var userjson = $.parseJSON($("input[name=userjson]").val());
var userTobagi = $("input[name=userTobagi]").val();
$(document).ready(function(){
  initGraph();
  var dateNow = new Date();
  var dateFrom = new Date(dateNow-10800000);
  // 선언한 TextBox에 DateTimePicker 위젯을 적용한다.
  $('#fromDateDecibel').datetimepicker({
    useCurrent : false,
    defaultDate: dateFrom,
    language : 'ko',
    format : 'YYYY-MM-DD HH:mm:ss'
  });
  $('#toDateDecibel').datetimepicker({
    useCurrent : false,
    defaultDate: dateNow,
    language : 'ko',
    format : 'YYYY-MM-DD HH:mm:ss'
  });
  $('#fromDateTempA').datetimepicker({
    useCurrent : false,
    defaultDate: dateFrom,
    language : 'ko',
    format : 'YYYY-MM-DD HH:mm:ss'
  });
  $('#toDateTempA').datetimepicker({
    useCurrent : false,
    defaultDate: dateNow,
    language : 'ko',
    format : 'YYYY-MM-DD HH:mm:ss'
  });
  $('#fromDateHumiA').datetimepicker({
    useCurrent : false,
    defaultDate: dateFrom,
    language : 'ko',
    format : 'YYYY-MM-DD HH:mm:ss'
  });
  $('#toDateHumiA').datetimepicker({
    useCurrent : false,
    defaultDate: dateNow,
    language : 'ko',
    format : 'YYYY-MM-DD HH:mm:ss'
  });
  $('#fromDateDistActivity').datetimepicker({
    useCurrent : false,
    defaultDate: dateFrom,
    language : 'ko',
    format : 'YYYY-MM-DD HH:mm:ss'
  });
  $('#toDateDistActivity').datetimepicker({
    useCurrent : false,
    defaultDate: dateNow,
    language : 'ko',
    format : 'YYYY-MM-DD HH:mm:ss'
  });

  //클릭 이벤트
  $('#decibelBtn').click(function(){
    var searchDate = {
      fromdate : $('#fromDateDecibel').find("input").val(),
      todate : $('#toDateDecibel').find("input").val()
    };
    redrawGraph(searchDate, '#decibelGraph', 'decibel', 120);
  });
  $('#tempABtn').click(function(){
    var searchDate = {
      fromdate : $('#fromDateTempA').find("input").val(),
      todate : $('#toDateTempA').find("input").val()
    };
    redrawGraph(searchDate, '#tempAGraph', 'tempA', 50);
  });
  $('#humiABtn').click(function(){
    var searchDate = {
      fromdate : $('#fromDateHumiA').find("input").val(),
      todate : $('#toDateHumiA').find("input").val()
    };
    redrawGraph(searchDate, '#humiAGraph', 'humiA', 100);
  });
  $('#distActivityBtn').click(function(){
    var searchDate = {
      fromdate : $('#fromDateDistActivity').find("input").val(),
      todate : $('#toDateDistActivity').find("input").val()
    };
    redrawGraph(searchDate, '#distActivityGraph', 'distActivity', 100);
  });
});


function initGraph(){
  $.ajax({
    url: 'monitor/initmonitor',
    async: false,
    dataType: "json",
    success: function(monitors){
      // Set the dimensions of the canvas / graph
      var margin = {top: 10, right: 40, bottom: 60, left: 40};
      var width = 1100- margin.left - margin.right;
      var height = 300 - margin.top - margin.bottom;
      var timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S.000Z');

      initDraw("#decibelGraph", margin, width, height, timeFormat, monitors, "decibel", 120);
      initDraw("#tempAGraph", margin, width, height, timeFormat, monitors, "tempA", 50);
      initDraw("#humiAGraph", margin, width, height, timeFormat, monitors, "humiA", 100);
      initDraw("#distActivityGraph", margin, width, height, timeFormat, monitors, "distActivity", 100);

    }
  });
}

function initDraw(id, margin, width, height, timeFormat, monitors, type, max){

  //adds the svg canvas
  var svg = d3.select(id)
    .append("svg")
      .attr("id", type+"Svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate("+margin.left+","+margin.top+")");
  //x,y axis setting
  var timeStart = timeFormat.parse(monitors[0].measureDate);
  var timeFinish = timeFormat.parse(monitors[monitors.length-1].measureDate);
  var x = d3.time.scale()
    .domain([timeStart, timeFinish])
    .rangeRound([0, width], 1);
  var y = d3.scale.linear().domain([0, max]).range([height, 0]);
  var timeUnit;
  var gapUnit;
  var timeGap = (timeFinish - timeStart);
  var d3TimeForm;
  if(timeGap  <= 60000){//조회범위가 1분 이하일때
    timeUnit = "d3.time.second";
    gapUnit = 10;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H:%M:%S')";
  }else if(timeGap <= 300000){//조회범위가 5분 이하일 때
    timeUnit = "d3.time.minute";
    gapUnit = 1;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H:%M')";
  }else if(timeGap <= 600000){//조회범위가 10분 이하일 때
    timeUnit = "d3.time.minute";
    gapUnit = 2;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H:%M')";
  }else if(timeGap <= 1800000){//조회범위가 30분 이하일 때
    timeUnit = "d3.time.minute";
    gapUnit = 10;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H:%M')";
  }else if(timeGap <= 3600000){//조회범위가 1시간 이하일 때
    timeUnit = "d3.time.minute";
    gapUnit = 20;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H')";
  }else if(timeGap <= 18000000){//조회범위가 5시간 이하일 때
    timeUnit = "d3.time.hour";
    gapUnit = 1;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H:%M:%S')";
  }else if(timeGap <= 43200000){//조회범위가 12시간 이하일 때
    timeUnit = "d3.time.hour";
    gapUnit = 2;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H')";
  }else if(timeGap <= 43200000){//조회범위가 12시간 이하일 때
    timeUnit = "d3.time.hour";
    gapUnit = 2;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H')";
  }else if(timeGap <= 86400000){//조회범위가 24시간 이하일 때
    timeUnit = "d3.time.hour";
    gapUnit = 5;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H')";
  }else if(timeGap <= 86400000){//조회범위가 7일 이하일 때
    timeUnit = "d3.time.days";
    gapUnit = 1;
    d3TimeForm = "d3.time.format('%Y.%m.%d')";
  }else if(timeGap <= 86400000){//조회범위가 31일 이하일 때
    timeUnit = "d3.time.days";
    gapUnit = 7;
    d3TimeForm = "d3.time.format('%Y.%m.%d')";
  }else{//조회범위가 한달 초과 시
    timeUnit = "d3.time.months";
    gapUnit = 7;
    d3TimeForm = "d3.time.format('%Y.%m')";
  }

  var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(eval(timeUnit), gapUnit).tickFormat(eval(d3TimeForm));
  var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);


  //draw x,y axis
  svg.selectAll("line.y")
    .data(y.ticks(5))
    .enter().append("line")
    .attr("class", "y")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y)
    .attr("y2", y)
    .style("stroke", "#ccc");

  svg.append('g')
    .attr('class', 'x_axis')
    .attr('transform', 'translate(0, '+height+')')
    .call(xAxis);

  svg.append("g")
    .attr('class', 'y_axis')
    .call(yAxis);

  var typeval = "d."+type;
  var line = d3.svg.line()				// SVG의 선
    .x(function(d) {
       // X 좌표는 표시 순서 X 간격
      return x(timeFormat.parse(d.measureDate));
    })
    .y(function(d) {
      // 데이터로부터 Y 좌표 빼기
      return y(eval(typeval));
    }).interpolate("linear");

  //Input Line
  svg.append("path")
    .attr('d', line(monitors))
    .attr('stroke', 'green')
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  //Draw Circle
  svg.selectAll("dot")
    .data(monitors)
  .enter()
    .append("circle")
      .attr("r", 1)
      .attr("cx", function(d) { return x(timeFormat.parse(d.measureDate)); })
      .attr("cy", function(d) { return y(eval(typeval)); });

}

function redrawGraph(searchDate, id, type, max){
  //$("#tempADate").append('').html("??");
  if(searchDate.todate&&searchDate.fromdate){
    $.ajax({
      url: 'monitor/redrawGraph',
      type: "POST",
      data: searchDate,
      async: false,
      dataType: "json",
      success: function(monitors){
        // Set the dimensions of the canvas / graph
        var margin = {top: 10, right: 40, bottom: 60, left: 40};
        var width = 1100- margin.left - margin.right;
        var height = 300 - margin.top - margin.bottom;
        var timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S.000Z');
        if(monitors.length>0){
          redraw(id, margin, width, height, timeFormat, monitors, type, max);
        }else{
          window.alert("조회 데이터가 없습니다."+monitors.length);
        }

      }
    });
  }else{
    window.alert("시간을 모두 입력해주세요.");
  }

}

function redraw(id, margin, width, height, timeFormat, monitors, type, max){

  $(id).empty();
  //adds the svg canvas
  var svg = d3.select(id)
    .append("svg")
      .attr("id", type+"Svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate("+margin.left+","+margin.top+")");
  //x,y axis setting
  var timeStart = timeFormat.parse(monitors[0].measureDate);
  var timeFinish = timeFormat.parse(monitors[monitors.length-1].measureDate);
  var x = d3.time.scale()
    .domain([timeFormat.parse(monitors[0].measureDate), timeFormat.parse(monitors[monitors.length-1].measureDate)])
    .rangeRound([0, width], 1);
  var y = d3.scale.linear().domain([0, max]).range([height, 0]);
  var timeUnit;
  var gapUnit;
  var timeGap = (timeFinish - timeStart);
  var d3TimeForm;
  if(timeGap  <= 60000){//조회범위가 1분 이하일때
    timeUnit = "d3.time.second";
    gapUnit = 10;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H:%M:%S')";
  }else if(timeGap <= 300000){//조회범위가 5분 이하일 때
    timeUnit = "d3.time.minute";
    gapUnit = 1;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H:%M')";
  }else if(timeGap <= 600000){//조회범위가 10분 이하일 때
    timeUnit = "d3.time.minute";
    gapUnit = 2;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H:%M')";
  }else if(timeGap <= 1800000){//조회범위가 30분 이하일 때
    timeUnit = "d3.time.minute";
    gapUnit = 10;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H:%M')";
  }else if(timeGap <= 3600000){//조회범위가 1시간 이하일 때
    timeUnit = "d3.time.minute";
    gapUnit = 20;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H')";
  }else if(timeGap <= 18000000){//조회범위가 5시간 이하일 때
    timeUnit = "d3.time.hour";
    gapUnit = 1;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H:%M:%S')";
  }else if(timeGap <= 43200000){//조회범위가 12시간 이하일 때
    timeUnit = "d3.time.hour";
    gapUnit = 2;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H')";
  }else if(timeGap <= 43200000){//조회범위가 12시간 이하일 때
    timeUnit = "d3.time.hour";
    gapUnit = 2;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H')";
  }else if(timeGap <= 86400000){//조회범위가 24시간 이하일 때
    timeUnit = "d3.time.hour";
    gapUnit = 5;
    d3TimeForm = "d3.time.format('%Y.%m.%d %H')";
  }else if(timeGap <= 86400000){//조회범위가 7일 이하일 때
    timeUnit = "d3.time.days";
    gapUnit = 1;
    d3TimeForm = "d3.time.format('%Y.%m.%d')";
  }else if(timeGap <= 86400000){//조회범위가 31일 이하일 때
    timeUnit = "d3.time.days";
    gapUnit = 7;
    d3TimeForm = "d3.time.format('%Y.%m.%d')";
  }else{//조회범위가 한달 초과 시
    timeUnit = "d3.time.months";
    gapUnit = 7;
    d3TimeForm = "d3.time.format('%Y.%m')";
  }

  var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(eval(timeUnit), gapUnit).tickFormat(eval(d3TimeForm));
  var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);


  //draw x,y axis
  svg.selectAll("line.y")
    .data(y.ticks(5))
    .enter().append("line")
    .attr("class", "y")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y)
    .attr("y2", y)
    .style("stroke", "#ccc");

  svg.append('g')
    .attr('class', 'x_axis')
    .attr('transform', 'translate(0, '+height+')')
    .call(xAxis);

  svg.append("g")
    .attr('class', 'y_axis')
    .call(yAxis);

  var typeval = "d."+type;
  var line = d3.svg.line()				// SVG의 선
    .x(function(d) {
       // X 좌표는 표시 순서 X 간격
      return x(timeFormat.parse(d.measureDate));
    })
    .y(function(d) {
      // 데이터로부터 Y 좌표 빼기
      return y(eval(typeval));
    }).interpolate("linear");

  //Input Line
  svg.append("path")
    .attr('d', line(monitors))
    .attr('stroke', 'green')
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  //Draw Circle
  svg.selectAll("dot")
    .data(monitors)
  .enter()
    .append("circle")
      .attr("r", 1)
      .attr("cx", function(d) { return x(timeFormat.parse(d.measureDate)); })
      .attr("cy", function(d) { return y(eval(typeval)); });
  var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(eval(timeUnit), gapUnit).tickFormat(eval(d3TimeForm));
  var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);


  //draw x,y axis
  svg.selectAll("line.y")
    .data(y.ticks(5))
    .enter().append("line")
    .attr("class", "y")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y)
    .attr("y2", y)
    .style("stroke", "#ccc");

  svg.append('g')
    .attr('class', 'x_axis')
    .attr('transform', 'translate(0, '+height+')')
    .call(xAxis);

  svg.append("g")
    .attr('class', 'y_axis')
    .call(yAxis);

  var typeval = "d."+type;
  var line = d3.svg.line()				// SVG의 선
    .x(function(d) {
       // X 좌표는 표시 순서 X 간격
      return x(timeFormat.parse(d.measureDate));
    })
    .y(function(d) {
      // 데이터로부터 Y 좌표 빼기
      return y(eval(typeval));
    }).interpolate("linear");

  //Input Line
  svg.append("path")
    .attr('d', line(monitors))
    .attr('stroke', 'green')
    .attr('stroke-width', 2)
    .attr('fill', 'none');

  //Draw Circle
  svg.selectAll("dot")
    .data(monitors)
  .enter()
    .append("circle")
      .attr("r", 1)
      .attr("cx", function(d) { return x(timeFormat.parse(d.measureDate)); })
      .attr("cy", function(d) { return y(eval(typeval)); });

}
