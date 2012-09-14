define([
  // These are path alias that we configured in our bootstrap
  'jquery',     
  'underscore', 
  'backbone',
	'backbone.marionette',
	'menu',
	'afford_content',
	'home_search',
	'cost_analysis',
	'paydown'
], function($, _, Backbone, Marionette, Menu, AffordLayout, HomeSearchLayout,CostAnalysisLayout, PaydownLayout){
  // Above we have passed in jQuery, Underscore, Backbone, and Marionette
  // They will not be accesible in the global scope
	var App = new Backbone.Marionette.Application();
	
	App.addRegions({
		content: "#layout-template",
		menu: "#demo_menu"
	});
	
	var MainContent = {};
	App.MainContent = MainContent;
	var menu = new Menu();
	
	MainContent.initializeLayout = function(){
		console.log('MainContent init called');
		
		App.menu.attachView(menu);
		
		App.MainContent.HomeSearch = new HomeSearchLayout.HomeSearch();
		App.MainContent.Afford = new AffordLayout.Afford();
		App.MainContent.CostAnalysis = new CostAnalysisLayout.CostAnalysis();
		App.MainContent.Paydown = new PaydownLayout.Paydown();
		
		menu.on('afford:render', function(){
			App.routing.navigate('',{trigger:true});
		});
		
		menu.on('homesearch:render',function(){
			App.routing.navigate('search',{trigger:true});
		});
		
		menu.on('costanalysis:render', function(){
			App.routing.navigate('analysis',{trigger:true});
		});
		
		menu.on('paydown:render', function(){
			App.routing.navigate('paydown',{trigger:true});
		});
	};
	
	App.MainContent.defaultRoute = function(){
		console.log('default route called');
		App.content.show(App.MainContent.Afford);
		App.MainContent.Afford.display();
		menu.showAfford();
	};
	
	App.MainContent.search = function(){
		console.log('search route called');	
		App.content.show(App.MainContent.HomeSearch);
		App.MainContent.HomeSearch.sidebar.show(new HomeSearchLayout.Sidebar());
		menu.showSearch();
	};
	
	App.MainContent.cost_analysis = function(){
		console.log('analysis route called');
		App.content.show(App.MainContent.CostAnalysis);
		App.MainContent.CostAnalysis.sidebar.show(new CostAnalysisLayout.Sidebar());
		menu.showAnalysis();
	};
	
	App.MainContent.paydown = function(){
		console.log('paydown route called');
		App.content.show(App.MainContent.Paydown);
		App.MainContent.Paydown.display();
		menu.showPaydown();
	};
	
	App.Router = Backbone.Marionette.AppRouter.extend({
		appRoutes:{
			"": "defaultRoute",
			"search": "search",
			"analysis": "cost_analysis",
			"paydown": "paydown"
		}
	});
		
	App.addInitializer(function(){
			App.MainContent.initializeLayout();
			App.routing = new App.Router({
				controller: App.MainContent
			});
			App.vent.trigger("routing:started");
	});
	
	App.vent.on('routing:started', function(){
		console.log('routing started');
		if(!Backbone.history.started){
			Backbone.history.start();
		}
	});
	
  return App;
  // What we return here will be used by other modules
});