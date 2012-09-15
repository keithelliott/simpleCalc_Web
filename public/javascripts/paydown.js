define([
	'jquery',     
  'underscore', 
  'backbone',
	'backbone.marionette',
	'accounting',
	'constantpayment',
	'text!templates/paydown_inputs.html',
	'text!templates/paydown_outputs.html'
	], function($,_,Backbone,Marionette, accounting, constantpayment, paydown_inputs, paydown_outputs){
		
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
				var input_model = new PaydownLayout.inputModel();
				var inputs = new PaydownLayout.Inputs({model:input_model});
				var output_model = new PaydownLayout.outputModel();
				var outputs = new PaydownLayout.Outputs({model: output_model});
				var amortlist = new PaydownLayout.AmortList();
				var amortization = new PaydownLayout.AmortizationCollectionView({collection: amortlist});
				this.sidebar.show(sidebar);
				this.inputs.show(inputs);
				this.outputs.show(outputs);
				this.amortization.show(amortization);
				
				input_model.on('all', function(){
					console.log('inputs changed');
					var ConstantPayment = new constantpayment();
					ConstantPayment.init({loanAmount: input_model.get('loan_amount'),
						interestRate: input_model.get('interest_rate') / 100,
						term: input_model.get('term'),
						extraPrincPaymentPerMonth: input_model.get('paydown_amount')});
					
					var payoffyr = ConstantPayment.determinePayOffYear();
					if(!isNaN(payoffyr)){
						output_model.set('current_interest' , ConstantPayment.determineBaseTotalInterestPaid());
						output_model.set('proj_interest' , ConstantPayment.determineTotalInterestPaid());
						output_model.set('interest_saved' , output_model.get('current_interest') - output_model.get('proj_interest'));
						output_model.set('proj_payoff_yr' , payoffyr);
						output_model.set('current_payoff_yr' , input_model.get('term'));
						
						var amort = ConstantPayment.getAmortizationSchedule();
						var cnt = 1;
						amort.forEach(function(a){
							if(a.begBal !== 0){
								amortlist.push(new PaydownLayout.AmortModel({
									num: cnt, 
									beginning_bal: accounting.formatMoney(a.begBal), 
									total_payment: accounting.formatMoney(a.totalPayment),
									interest_payment: accounting.formatMoney(a.interestPayment), 
									principal_payment: accounting.formatMoney(a.principalPayment),
									additional_principal: accounting.formatMoney(a.extraPrincPayment), 
									ending_bal: accounting.formatMoney(a.endBal)
									}));
								cnt = cnt + 1;
							}
						});
					}
				});				

			}

		});
		
		var sidebar = Backbone.Marionette.ItemView.extend({
			template: '#paydownMenu'
		});
		
		var inputModel = Backbone.Model.extend();
		var inputs = Backbone.Marionette.ItemView.extend({
			template: paydown_inputs,
			events: {
				'change #loan_amount': 'inputsChanged',
				'change #interest_rate': 'inputsChanged',
				'change #loan_term': 'inputsChanged',
				'change #paydown_amount': 'inputsChanged'
			},
			
			inputsChanged: function(){
				console.log('changes made to inputs');
				this.model.set('loan_amount' , $(this.el).find('#loan_amount').val());
				this.model.set('interest_rate' , $(this.el).find('#interest_rate').val());
				this.model.set('term' , $(this.el).find('#loan_term').val());
				this.model.set('paydown_amount' , $(this.el).find('#paydown_amount').val());
			}
		});	
		
		var outputModel = Backbone.Model.extend();
		
		var outputs = Backbone.Marionette.ItemView.extend({
			template: paydown_outputs,
			initialize: function(){
				this.bindTo(this.model,'change', this.outputsChanged);
			},
			outputsChanged: function(e){
				$(this.el).find('#current_interest').html(accounting.formatMoney(this.model.get('current_interest')));
				$(this.el).find('#proj_interest').html(accounting.formatMoney(this.model.get('proj_interest')));
				$(this.el).find('#interest_saved').html(accounting.formatMoney(this.model.get('interest_saved')));
				$(this.el).find('#current_payoff_yr').html(Math.round(this.model.get('current_payoff_yr') * 100)/100);
				$(this.el).find('#proj_payoff_yr').html(Math.round(this.model.get('proj_payoff_yr') * 100)/100);
			}
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
			    collectionView.$("tbody").append(itemView.el);
			}
		});
		
		PaydownLayout.Paydown = Paydown;
		PaydownLayout.Sidebar = sidebar;
		PaydownLayout.inputModel = inputModel;
		PaydownLayout.Inputs = inputs;
		PaydownLayout.outputModel = outputModel;
		PaydownLayout.Outputs = outputs;
		PaydownLayout.AmortModel = AmortModel;
		PaydownLayout.AmortList = AmortList;
		PaydownLayout.AmortizationRow = AmortizationRow;
		PaydownLayout.AmortizationCollectionView = AmortizationCollectionView;
		
		return PaydownLayout;
	});