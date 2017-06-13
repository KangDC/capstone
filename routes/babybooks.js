var express = require('express'),
    multer  = require('multer'),
    path = require('path'),
    _ = require('lodash'),
    fs = require('fs'),
    upload = multer({ dest: 'tmp' }),
    BabyBook = require('../models/BabyBook'),
    Monitor = require('../models/Monitor'),
    User = require('../models/User');
var router = express.Router();
var mimetypes = {
  "image/svg": "svg",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/png": "png"
};

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', '로그인이 필요합니다.');
    res.redirect('/login');
  }
}

function validateForm(form) {
  var email = form.email || "";
  var title = form.title || "";
  //email과  title을 앞뒤에 공백이 없게...
  email = email.trim();
  title = title.trim();

  if (!form.content) {
    return '글내용을 입력해주세요.';
  }

  return null;
}

function Pagination(count, limit, page){
    // 경로를 저장할 변수
    var  url;
    // 마지막 페이지의 번호를 가지는 변수
    var maxPage = Math.ceil(count / limit);

    // 모든 페이지들의 정보를 담은 변수
    var pagination = {
        numBabybooks : count,
        pages : [],
        firstPage : {
            cls : 'firstPage',
            url : '/babybooks?page=1'
        },
        prevPage : {             // 이전 페이지 정보
            cls : 'prevPage',
            url : url
        },
        nextPage : {             // 다음 페이지 정보
            cls : 'nextPage',
            url : url
        },
        lastPage : {             // 마지막 페이지 정보
            cls : 'lastPage',
            url : '/babybooks?page='+maxPage
        },
    };

    // 이전 페이지 객체의 내부 변수 설정
    if(!(page) || (page) === 1){
        pagination.prevPage.url = '/babybooks?page=1';
    }else{
        pagination.prevPage.url = '/babybooks?page='+(page - 1);
    }

    // 다음 페이지 객체의 내부 변수 설정
    if(!(page)){
        if(maxPage === 1){
            pagination.nextPage.url = '/babybooks?page=1';
        }else{
            pagination.nextPage.url = '/babybooks?page=2';
        }
    }else if(parseInt(page) === parseInt(maxPage)){
        pagination.nextPage.url = '/babybooks?page='+maxPage;
    }else{
        pagination.nextPage.url = '/babybooks?page='+(page + 1);
    }

    // 반복문을 실행하면서 각각의 페이지 객체의 내부 변수 설정
    for(var i = 0; i < maxPage; i++){
        var data = {
            cls : 'page',
            url : '/babybooks?page='+(i+1),
            text : i+1
        };
        pagination.pages[i] = data;
    }

    return pagination;
}

//게시판 누르면...
router.get('/', needAuth, function(req, res, next) {
  var page = Math.max(1, req.query.page);
  var limit = 10;
  var skip = (page - 1) * limit;

  BabyBook.count({email :  res.locals.currentUser.email}, function(err, count){
      if(err){
           return next(err);
      }
      var pagination = Pagination(count, limit, page);
        BabyBook.find({email :  res.locals.currentUser.email}).sort({createdAt:-1}).skip(skip)
        .limit(limit).exec(function(err, babybooks) {
          if (err) {
               return next(err);
          }

          res.render('babybooks/index', {user: res.locals.currentUser,
            babybooks: babybooks, pagination:pagination});
      });
  });
});

//글쓰기 버튼 누르면...
router.get('/new', needAuth,  function(req, res, next) {
  res.render('babybooks/edit', {user: res.locals.currentUser, babybook:{}});
});

//수정 버튼 누르면...
router.get('/:id/edit', needAuth,  function(req, res, next) {
  BabyBook.findById({_id: req.params.id}, function(err, babybook) {
    if (err) {
      return next(err);
    }
    User.findOne({email: babybook.email}, function(err, user) {
      if(err) {
        return next(err);
      }
      if(user.email !== res.locals.currentUser.email) {
        req.flash('danger', '작성자가 아닙니다.');
        return res.redirect('back');
      }
      res.render('babybooks/edit', {user: user, babybook: babybook});
    });
  });
});

//글제목 누르면...
router.get('/:id', needAuth, function(req, res, next) {
  BabyBook.findById({_id: req.params.id}, function(err, babybook) {
    if (err) {
      return next(err);
    }
    //조회수 증가해주고
    babybook.read++;
    //저장
    babybook.save(function(err) {
      if (err) {
        return next(err);
      }
      res.render('babybooks/show', {user: res.locals.currentUser, babybook: babybook});
    });
  });
});

//글 수정 부분
router.put('/:id', needAuth,  function(req, res, next) {
  var err = validateForm(req.body);
  if (err) {
    return res.redirect('back');
  }
  //id일치하는 것 찾아서
  BabyBook.findById({_id: req.params.id}, function(err, babybook) {
    if (err) {
      return next(err);
    }
    if (!babybook) {
      return res.redirect('back');
    }
    User.findOne({email: babybook.email}, function(err, user) {
      if (err) {
        return next(err);
      }
      if(user.email !== res.locals.currentUser.email) {
        req.flash('danger', '작성자가 아닙니다.');
        return res.redirect('back');
      }
      //title, content 수정
      babybook.title = req.body.title;
      babybook.content = req.body.content;
      if(req.body.atcRcd){
        console.log("들어간다");
        babybook.atcRcd = req.body.atcRcd;
        babybook.fromDate = req.body.fromDate;
        babybook.toDate = req.body.toDate;
        babybook.avgTemp = req.body.avgTemp;
        babybook.avgHumi = req.body.avgHumi;
        babybook.cryHour = req.body.cryHour;
        babybook.actHour = req.body.actHour;
      }
    });
    //저장
    babybook.save(function(err) {
      if (err) {
        return next(err);
      }
      //게시물 목록으로 이동...
      res.redirect('/babybooks');
    });
  });
});

//삭제...
router.delete('/:id', needAuth, function(req, res, next) {
  //id일치하는 것 찾아서
  BabyBook.findById({_id: req.params.id}, function(err, babybook) {
    if (err) {
      return next(err);
    }
    if (!babybook) {
      return res.redirect('back');
    }
    User.findOne({email: babybook.email}, function(err, user) {
      if (err) {
        return next(err);
      }
      if(user.email !== res.locals.currentUser.email) {
        req.flash('danger', '작성자가 아닙니다.');
        return res.redirect('back');
      }
      babybook.remove(function(err){
        if (err) {
          return next(err);
        }
        res.redirect('/babybooks');
      });
    });
  });
});

router.post('/', needAuth, function(req, res, next) {
  var err = validateForm(req.body);
  if (err) {
    return res.redirect('back');
  }
  //새 육아일기 객체 생성해서 받은 값들 넣어주고
  var newBabyBook;
  if(req.body.atcRcd){
    newBabyBook = new BabyBook({
      email: req.body.email,
      nickname: req.body.nickname,
      atcRcd: req.body.atcRcd,
      fromDate: req.body.fromDate,
      toDate: req.body.toDate,
      avgTemp: req.body.avgTemp,
      avgHumi:req.body.avgHumi,
      cryHour:req.body.cryHour,
      actHour:req.body.actHour,
      title: req.body.title,
      content: req.body.content,
      //images: images,
      read: 0
    });
  }else{
    newBabyBook = new BabyBook({
      email: req.body.email,
      nickname: req.body.nickname,
      title: req.body.title,
      content: req.body.content,
      //images: images,
      read: 0
    });
  }

  //저장
  newBabyBook.save(function(err) {
    if (err) {
      return next(err);
    } else {
      //육아일기 목록으로 이동...
      res.redirect('/babybooks');
    }
  });
});

router.post('/searchRcd', needAuth, function(req, res, next) {
  var cryHour;
  var avgTemp;
  var avgHumi;
  var actHour;
  var nMonirots;
  var tdt = new Date(new Date((new Date(req.body.todate)).toISOString()).setHours((new Date(req.body.todate)).getHours()+9));
  var fdt = new Date(new Date((new Date(req.body.fromdate)).toISOString()).setHours((new Date(req.body.fromdate)).getHours()+9));
  Monitor.find({tobagiNo : res.locals.currentUser.tobagiNo, measureDate : {"$gte" : fdt, "$lte" : tdt}}).exec(function(err, monitors){
    if (err) {
      console.log("err" + err);
    }else{
      nMonirots = monitors.length;
      var n = 0;
      var sumT = 0;
      var sumH = 0;
      var hours =  Array.apply(null, new Array(24)).map(Number.prototype.valueOf,0);
      for(var i = 0 ; i < monitors.length; i++ ){
        var tmpT = (new Date(monitors[i].measureDate-32400000)).getHours();
        n++;
        sumT += monitors[i].tempA;
        sumH += monitors[i].humiA;
        tmpT *= 1;
        hours[tmpT] += monitors[i].distActivity;
      }
      if(n!==0){
        avgTemp = sumT/n;
        avgHumi = sumH/n;
      }
      var max = hours.reduce( function (previous, current) {
    	   return previous > current ? previous:current;
      });

      if(max!==0){
        actHour = hours.indexOf(max);
      }
    }
    Monitor.find({tobagiNo : res.locals.currentUser.tobagiNo, measureDate : {"$gte" : fdt, "$lte" : tdt}, distdB : 1}).exec(function(err, monitors){
      if (err) {
        console.log("err" + err);
      }else{
        var hours =  Array.apply(null, new Array(24)).map(Number.prototype.valueOf,0);
        for(var i = 0 ; i < monitors.length; i++ ){
          var tmpT = (new Date(monitors[i].measureDate)).getHours();
          tmpT *= 1;
          if(tmpT === 0){
            hours[23]++;
          }else{
            hours[tmpT-1]++;
          }
          hours[tmpT] = hours[tmpT] + 2;
          if(tmpT === 23){
            hours[0]++;
          }else{
            hours[tmpT+1]++;
          }
        }
        var max = hours.reduce( function (previous, current) {
      	   return previous > current ? previous:current;
        });
        if(max!==0){
          cryHour = hours.indexOf(max);
        }
        var data;
        if(nMonirots > 0){
          data = {
            cryH : cryHour,
            actH : actHour,
            avgT : avgTemp.toFixed(2),
            avgH : avgHumi.toFixed(2)
          };
          res.send(data);
        }else{
          res.send([]);
        }
      }
    });
  });
});

module.exports = router;
