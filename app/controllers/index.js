// controllers/index.js

var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article'),
  User = mongoose.model('User');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  
  //, order: 'createdAt DESC'
  Article.find(function (err, articles) {
    if (err) return next(err);
    res.render('index', {articles: articles, user: req.user});
    console.log(articles);
  });
});