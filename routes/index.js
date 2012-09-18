
/*
 * GET home page.
 */

exports.index = function(req, res){
  var variables = {title: 'SimpleCalc', description: 'SimpleCalc analyzes your life and helps you find the right house that perfectly fits your lifestyle and budget'};
	variables['author'] = 'Keith Elliott';
	variables['user'] = req.user;
  res.render('index', variables);
};

exports.demo = function(req, res){
	var variables = {title: 'SimpleCalc', description: 'SimpleCalc analyzes your life and helps you find the right house that perfectly fits your lifestyle and budget'};
	variables['author'] = 'Keith Elliott';
	variables['user'] = req.user;
  res.render('demo', variables);
};