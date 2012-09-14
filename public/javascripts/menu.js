define([
  // These are path alias that we configured in our bootstrap
  'jquery',     
  'underscore', 
  'backbone',
	'backbone.marionette',
	'app'
], function($, _, Backbone, Marionette,App){
  // Above we have passed in jQuery, Underscore, Backbone, and Marionette
  // They will not be accesible in the global scope
	  var MenuView = Backbone.Marionette.ItemView.extend({
		el: "#demo_menu",
		
		events: {
			'click #affordability_menu' : 'showAffordability',
			'click #home_search_menu': 'showHomeSearch',
			'click #cost_analysis_menu': 'showCostAnalysis',
			'click #paydown_menu': 'showPaydownPayoff'
		},
		
		showAffordability: function(e){
			e.preventDefault();
			this.showAfford();
			console.log('Affordability menu clicked');
			this.trigger('afford:render');
		},
		
		showAfford: function(){
			$('#demo_menu li').removeClass('active');
			$('#affordability_menu').parent().addClass('active');
		},
		
		showHomeSearch: function(e){
			e.preventDefault();
			this.showSearch();
			console.log('Home Search menu clicked');
			this.trigger('homesearch:render');
		},
		
		showSearch: function(){
			$('#demo_menu li').removeClass('active');
			$('#home_search_menu').parent().addClass('active');
		},
		
		showCostAnalysis: function(e){
			e.preventDefault();
			this.showAnalysis();
			console.log('Cost Analysis menu clicked');
			this.trigger('costanalysis:render');
		},
		
		showAnalysis: function(){
			$('#demo_menu li').removeClass('active');
			$('#cost_analysis_menu').parent().addClass('active');
		},
		
		showPaydownPayoff: function(e){
			e.preventDefault();
			this.showPaydown();
			console.log('Paydown/Payoff menu clicked');
			this.trigger('paydown:render');
		},
		
		showPaydown: function(){
			$('#demo_menu li').removeClass('active');
			$('#paydown_menu').parent().addClass('active');
		}
	});
		
	return MenuView;
});