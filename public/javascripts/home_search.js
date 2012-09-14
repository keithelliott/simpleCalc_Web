define([
	'jquery',     
  'underscore', 
  'backbone',
	'backbone.marionette'
	], function($,_,Backbone,Marionette){
		
		var HomeSearchLayout = {};
		
		var HomeSearch = Backbone.Marionette.Layout.extend({
			template: '#homeSearch_template',
			
			regions: {
				'sidebar' : '#demo_sidebar',
				'content' : '#demo_content'
			}

		});
		
		HomeSearchLayout.HomeSearch = HomeSearch;
		
		var sidebar = Backbone.Marionette.ItemView.extend({
			template: '#homeSearchMenu'
		});		
		
		HomeSearchLayout.Sidebar = sidebar;
		return HomeSearchLayout;
	});