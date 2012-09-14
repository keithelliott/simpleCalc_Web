define([
	'jquery',     
  'underscore', 
  'backbone',
	'backbone.marionette',
	'accounting',
	'afford',
	'text!templates/paydown_inputs.html',
	'text!templates/paydown_outputs.html'
	], function($,_,Backbone,Marionette, accounting, afford, paydown_inputs, paydown_outputs){
		
		var PaydownLayout = {};
		
		var Paydown = Backbone.Marionette.Layout.extend({
			template: '#paydown_template',
			
			regions: {
				'sidebar' : '#demo_sidebar',
				'inputs' : '#paydown_inputs',
				'outputs': '#paydown_outputs',
				'amortization': '#amortization_table'
			},
			
			display: function(){
				var sidebar = new PaydownLayout.Sidebar();
				var inputs = new PaydownLayout.Inputs();
				var outputs = new PaydownLayout.Outputs();
				var amortlist = new PaydownLayout.AmortList();
				var amortization = new PaydownLayout.AmortizationCollectionView({collection: amortlist});
				this.sidebar.show(sidebar);
				this.inputs.show(inputs);
				this.outputs.show(outputs);
				this.amortization.show(amortization);
			}

		});
		
		var sidebar = Backbone.Marionette.ItemView.extend({
			template: '#paydownMenu'
		});
		
		var inputs = Backbone.Marionette.ItemView.extend({
			template: paydown_inputs
		});	
		
		var outputs = Backbone.Marionette.ItemView.extend({
			template: paydown_outputs
		});	
		
		var AmortModel = Backbone.Model.extend();
		
		var AmortList = Backbone.Collection.extend({
			model: AmortModel
		});
		
		var AmortizationRow = Backbone.Marionette.ItemView.extend({
			template: '#amort_row',
			tagName: 'tr'
		});
		
		var AmortizationCollectionView = Backbone.Marionette.CompositeView.extend({
			template: '#amort_schedule_view',
			id:'amort_sched',
			tagName: 'table',
			className: 'table table-striped table-condensed table-hover table-bordered',
			itemView: AmortizationRow,	
			initialize: function(){
		
			},
			
			appendHtml: function(collectionView, itemView){
				  console.log('collection has ' + collectionView.collection.length + ' items');
			    collectionView.$("tbody").append(itemView.el);
			}
		});
		
		PaydownLayout.Paydown = Paydown;
		PaydownLayout.Sidebar = sidebar;
		PaydownLayout.Inputs = inputs;
		PaydownLayout.Outputs = outputs;
		PaydownLayout.AmortModel = AmortModel;
		PaydownLayout.AmortList = AmortList;
		PaydownLayout.AmortizationRow = AmortizationRow;
		PaydownLayout.AmortizationCollectionView = AmortizationCollectionView;
		
		return PaydownLayout;
	});