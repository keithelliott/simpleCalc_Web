define([
	'jquery',     
  'underscore', 
  'backbone',
	'backbone.marionette'
	], function($,_,Backbone,Marionette){
		
		var CostAnalysisLayout = {};
		
		var CostAnalysis = Backbone.Marionette.Layout.extend({
			template: '#cost_analysis_template',
			
			regions: {
				'sidebar' : '#demo_sidebar',
				'content' : '#demo_content'
			}

		});
		
		CostAnalysisLayout.CostAnalysis = CostAnalysis;
		
		var sidebar = Backbone.Marionette.ItemView.extend({
			template: '#costAnalysisMenu'
		});		
		
		CostAnalysisLayout.Sidebar = sidebar;
		return CostAnalysisLayout;
	});