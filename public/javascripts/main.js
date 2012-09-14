// Require.js allows us to configure shortcut alias
// There usage will become more apparent futher along in the tutorial.
require.config({
  paths: {
		'jquery': '/javascripts/vendor/jquery/jquery-1.8.0.min',
    'underscore': '/javascripts/vendor/underscore/underscore-min',
    'backbone': '/javascripts/vendor/backbone/backbone-min',
		'backbone.marionette': '/javascripts/vendor/marionette/backbone.marionette',
		'Bootstrap':'/javascripts/vendor/bootstrap/bootstrap.min',
		'modernizr':'/javascripts/vendor/modernizr-2.6.1.min',
		'accounting': '/javascripts/vendor/accounting.min',
		"text": '/javascripts/vendor/text',
		"templates": '/templates'
  },
	shim: {
		'backbone.marionette':{
			deps: ['backbone']
			},
		'backbone' : {
				deps: ['underscore'],
				exports: 'Backbone'
			},
		'underscore':{
				deps: ['jquery'],
				exports: '_'
			}
	}
});

require([
  // Load our app module and pass it to our definition function
  'app'
  // Some plugins have to be loaded in order due to there non AMD compliance
  // Because these scripts are not "modules" they do not pass any values to the definition function below
], function(App){
  // The "app" dependency is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function		
  App.start();
});
