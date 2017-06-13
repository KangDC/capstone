module.exports = function(app, passport) {
  app.post('/login', passport.authenticate('local', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/auth/facebook',
    passport.authenticate('facebook', {authType: 'rerequest', scope : 'email' })
  );

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect : '/signin',
      failureFlash : true // allow flash messages
    }),
    function(req, res, next) {
      req.flash('success', '로그인되었습니다.');
      res.redirect('/todos');
    }
  );

  app.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', '로그아웃 되었습니다.');
    res.redirect('/');
  });
};
