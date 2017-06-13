/*global $:false */
/*global _:false */
/*jslint browser:true */

$(document).ready(function(){
  var dateNow = new Date();
  var dateFrom = new Date(dateNow-86400000);
  // 선언한 TextBox에 DateTimePicker 위젯을 적용한다.
  $('#fromAtcRcd').datetimepicker({
    useCurrent : false,
    defaultDate: dateFrom,
    language : 'ko',
    format : 'YYYY-MM-DD HH:mm:ss'
  });
  $('#toAtcRcd').datetimepicker({
    useCurrent : false,
    defaultDate: dateNow,
    language : 'ko',
    format : 'YYYY-MM-DD HH:mm:ss'
  });
  if($(':radio[id="atcRcdY"]:checked').length < 1){
    $("#pannelSlide").slideUp("slow");
  }

  //클릭 이벤트
  $('#atcRcdBtn').click(function(){
    var searchDate = {
      fromdate : $('#fromAtcRcd').find("input").val(),
      todate : $('#toAtcRcd').find("input").val()
    };
    atcRcd(searchDate);
  });
  $("#atcRcdY").click(function(){
    $("#pannelSlide").slideDown("slow");
  });
  $("#atcRcdN").click(function(){
    $("#pannelSlide").slideUp("slow");
  });
});

function atcRcd(searchDate){
  if(searchDate.todate&&searchDate.fromdate){
    $.ajax({
      url: '/babybooks/searchRcd',
      type: "POST",
      data: searchDate,
      async: false,
      dataType: "json",
      success: function(monitors){
        if(monitors!=""){
          $("#avgTemp").val(monitors.avgT);
          $("#avgHumi").val(monitors.avgH);
          if(monitors.cryH){
            $("#cryHour").val(monitors.cryH);
          }else{
            $("#cryHour").val("아이가 운 시간대가 없습니다.");
          }
          if(monitors.actH){
            $("#actHour").val(monitors.actH);
          }else{
          $("#cryHour").val("아이가 활동한 시간대가 없습니다.");
          }
        }else{
          window.alert("조회 데이터가 없습니다.");
        }

      }
    });
  }else{
    window.alert("시간을 모두 입력해주세요.");
  }

}
