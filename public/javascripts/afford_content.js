define([
	'jquery',     
  'underscore', 
  'backbone',
	'backbone.marionette',
	'accounting',
	'afford',
	'text!templates/afford_income_input.html',
	'text!templates/afford_expense.html',
	'text!templates/afford_ratios.html',
	'text!templates/afford_loan.html'
	], function($,_,Backbone, Marionette, accounting, AffordCalc, income_input, afford_expense, afford_ratio, loan_tmpl){
		
		var AffordLayout = {};
		
		var ModalRegion = Backbone.Marionette.Region.extend({
			el: "#modal",
			
			constructor: function(){
			    _.bindAll(this);
			    Backbone.Marionette.Region.prototype.constructor.apply(this, arguments);
			    this.on("view:show", this.showModal, this);
			  },

			  getEl: function(selector){
			    var $el = $(selector);
			    $el.on("hidden", this.close);
			    return $el;
			  },

			  showModal: function(view){
			    view.on("close", this.hideModal, this);
			    this.$el.modal('show');
			  },

			  hideModal: function(){
			    this.$el.modal('hide');
			  }
		});
		
		var Afford_Layout = Backbone.Marionette.Layout.extend({
			template: '#afford_template',
			
			regions: {
				'sidebar' : '#demo_sidebar',
				'income_input' : '#afford_income_input',
				'income_table' : '#income_table',
				'income_subtotal' : '#income_total',
				'expense_input' : '#afford_expense',
				'expense_table' : '#expense_table',
				'expense_subtotal' : '#expense_total',
				'debt_view' : '#afford_credit',
				'loan_view' : '#afford_loan',
				'outputs' : '#afford_outputs'
			},
			
			display: function(){
				
				var sidebar = new AffordLayout.Sidebar();
				var income_list = new AffordLayout.IncomeList();
				var income_input = new AffordLayout.income_input({collection: income_list});
				var income_table = new AffordLayout.income_table({collection: income_list});
				var income_subtotal = new AffordLayout.income_subtotal({collection:income_list});

				var expense_list = new AffordLayout.ExpenseList();
				var expense_input = new AffordLayout.expense_input({collection:expense_list});
				var expense_table = new AffordLayout.expense_table({collection: expense_list});
				var expense_subtotal = new AffordLayout.expense_subtotal({collection:expense_list});

				var debt = new AffordLayout.DebtRatios();
				var debtView = new AffordLayout.debt_view({model:debt});

				var loan = new AffordLayout.LoanAssumptions();
				var loan_view = new AffordLayout.LoanView({model:loan});
				var outputs = new AffordLayout.OutputsModel();
				var outputs_view = new AffordLayout.OutputsView({income_list: income_list, expense_list: expense_list,
					debt: debt, loan: loan, model:outputs});
					
				var display_outputs = function(){
					console.log('clearing income list');
					var affordCalc = new AffordCalc();
					var totalMonthlyIncome = 0;
					income_list.models.forEach(function(income){
						console.log('income:' + income.get('amount'));
						var moAmount = affordCalc.convertMonthly(income.get('amount'));
						console.log('adding ' + income.get('name') + ': ' + moAmount + ' to list');
						totalMonthlyIncome = totalMonthlyIncome + moAmount;
					});
					
					var totalMonthlyDebt = 0;
					expense_list.models.forEach(function(expense){
						var moAmount = expense.get('amount');
						console.log('adding ' + expense.get('name') + ': ' + moAmount + ' to list');
						totalMonthlyDebt = totalMonthlyDebt + accounting.unformat(moAmount);
					});
					
					var monthlyPaymentAggressive = affordCalc.calculateMonthlyPayment({
						totalMonthlyIncome : totalMonthlyIncome,
						totalMonthlyDebt : totalMonthlyDebt,
						debtToIncomeRatio : debt.get('DebtToIncomeAggressive') / 100,
						propertyTaxes : accounting.unformat(loan.get('tax_rate')),
						homeOwnersFeesYrly : accounting.unformat(loan.get('homeowners_amount'))
					});
					
					var monthlyPaymentConservative = affordCalc.calculateMonthlyPayment({
						totalMonthlyIncome : totalMonthlyIncome,
						totalMonthlyDebt : totalMonthlyDebt,
						debtToIncomeRatio : debt.get('DebtToIncomeConservative') / 100,
						propertyTaxes : accounting.unformat(loan.get('tax_rate')),
						homeOwnersFeesYrly : accounting.unformat(loan.get('homeowners_amount'))
					});
					
					var maxLoanAmount = affordCalc.calculateLoanAmount({
						payment: monthlyPaymentAggressive,
						interestRate: loan.get('interest_rate')/100,
						term: accounting.unformat(loan.get('term'))
					});
					
					var minLoanAmount = affordCalc.calculateLoanAmount({
						payment: monthlyPaymentConservative,
						interestRate: loan.get('interest_rate')/100,
						term: accounting.unformat(loan.get('term'))
					});
					
					outputs.set({'loan_aggressive' : accounting.formatMoney(maxLoanAmount),
						'loan_conservative': accounting.formatMoney(minLoanAmount),
						'payment_aggressive': accounting.formatMoney(monthlyPaymentAggressive),
						'payment_conservative': accounting.formatMoney(monthlyPaymentConservative),
						'taxes': accounting.formatMoney(loan.get('tax_rate') / 12),
						'total_aggressive': accounting.formatMoney(monthlyPaymentAggressive + accounting.unformat(loan.get('tax_rate'))/12),
						'total_conservative' : accounting.formatMoney(monthlyPaymentConservative + accounting.unformat(loan.get('tax_rate'))/12)});
					
				};
				
				income_list.on('change', display_outputs);
				income_list.on('add', display_outputs);
				income_list.on('remove', display_outputs);
				expense_list.on('change',display_outputs);
				expense_list.on('add',display_outputs);
				expense_list.on('remove',display_outputs);
				debt.on('change',display_outputs);
				loan.on('change', display_outputs);
				
				income_input.on('income:focus', function(){
					sidebar.focus_income();
				});

				debtView.on('ratio:focus', function(expense){
					sidebar.focus_ratio();
				});

				loan_view.on('loan:focus', function(expense){
					sidebar.focus_loan();
				});

				expense_input.on('expense:focus', function(expense){
					sidebar.focus_expense();
				});
		
				this.sidebar.show(sidebar);
				this.income_input.show(income_input);
				this.income_table.show(income_table);
				this.income_subtotal.show(income_subtotal);
				this.expense_input.show(expense_input);
				this.expense_table.show(expense_table);
				this.expense_subtotal.show(expense_subtotal);
				this.debt_view.show(debtView);
				this.loan_view.show(loan_view);
				this.outputs.show(outputs_view);
			}

		});
		
		AffordLayout.Afford = Afford_Layout;
		
		var sidebar = Backbone.Marionette.ItemView.extend({
			template: '#affordMenu',
			
			events: {
				'click #income_menu a' : 'focus_income',
				'click #expense_menu a': 'focus_expense',
				'click #ratio_menu a': 'focus_ratio',
				'click #loan_menu a': 'focus_loan',
				'click #outputs_menu a': 'focus_outputs'
			},
			
			ui:{
				income_menu : '#income_menu',
				expense_menu : '#expense_menu',
				ratio_menu : '#ratio_menu',
				loan_menu : '#loan_menu',
				outputs_menu : '#outputs_menu'
			},
			
			focus_income: function(e){			
				this.ui.income_menu.siblings().removeClass('active');
				this.ui.income_menu.addClass('active');
				return false;
			},
			
			focus_expense: function(e){
				this.ui.expense_menu.siblings().removeClass('active');
				this.ui.expense_menu.addClass('active');
				return false;
			},
			focus_ratio: function(e){
				this.ui.ratio_menu.siblings().removeClass('active');
				this.ui.ratio_menu.addClass('active');
				return false;
			},
			focus_loan: function(e){
				this.ui.loan_menu.siblings().removeClass('active');
				this.ui.loan_menu.addClass('active');
				return false;
			},
			focus_outputs: function(e){
				this.ui.outputs_menu.siblings().removeClass('active');
				this.ui.outputs_menu.addClass('active');
				return false;
			}
		});		
		
		var income_input = Backbone.Marionette.ItemView.extend({
			template: income_input,
			
			events:{
				'click #income_submit' : 'addRow',
				'change #income_name' : 'nameAdded',
				'change #income_amount' : 'amountAdded',
				'change #income_frequency': 'freq_changed'
			},
			
			triggers: {
				'mouseover #income_div': 'income:focus'
			},
			
			ui: {
				income_amount: '#income_amount',
				income_frequency: 'select#income_frequency',
				income_name : '#income_name',
				income_submit : '#income_submit'
			},
			
			freq_changed: function(e){
				this.ui.income_amount.attr('placeholder',this.ui.income_frequency.val() + ' Amount');
			},
			
			nameAdded: function(e){
				console.log(this.ui.income_name.val() + ' added');
			},
			
			amountAdded: function(e){
				console.log(this.ui.income_amount.val() + ' added');
			},
			
			addRow: function(e){
				e.preventDefault();
				console.log('new income added');
				var amount = parseFloat(this.ui.income_amount.val());
				if (this.ui.income_frequency.val() === 'Monthly'){
					amount = amount * 12;
				} 
				var income = new Income({'name': this.ui.income_name.val(),
				'amount': accounting.formatMoney(amount)});
				
				this.ui.income_name.attr('value','');
				this.ui.income_amount.attr('value', '');
				this.collection.add(income);
			}
		});
		
		var Income = Backbone.Model.extend();
		
		var IncomeList = Backbone.Collection.extend({
			model: Income
		});
		
		var IncomeView = Backbone.Marionette.ItemView.extend({
			template: '#income_item_view',
			tagName: 'tr',
			events: {
				'click tr:hover button.income_edit' : 'edit',
				'click tr:hover button.income_edit_done': 'done'
			},
			
			ui:{
				remove_btn: 'tr:hover button.income_remove',
				edit_btn: 'tr:hover button.income_edit',
				done_btn: 'tr:hover button.income_edit_done',
				text_input: 'tr:hover span.txt_input',
				text_cell: 'tr:hover span.txt_cell',
				name_cell: 'tr:hover .name_cell',
				amount_cell: 'tr:hover .amount_cell'
			},
			
			triggers:{
				'click tr:hover button.income_remove' : 'remove:model'
			},
			
			edit: function(e){
				e.preventDefault();
				console.log('edit called');
				this.ui.text_input.removeClass('hide');
				this.ui.text_cell.addClass('hide');
				this.ui.edit_btn.show();
				this.ui.done_btn.hide();
				
				return false;
			},
			
			done: function(e){
				e.preventDefault();
				console.log('done called');
				this.ui.text_input.addClass('hide');
				this.ui.text_cell.removeClass('hide');
				this.ui.edit_btn.hide();
				this.ui.done_btn.show();
				this.update(e);
				return false;
			},
			
			update: function(e){
				e.preventDefault();
				console.log('update called');
				this.model.set({'name': this.ui.name_cell.val(),
				'amount': accounting.formatMoney(this.ui.amount_cell.val()) });
				this.render();
			}
		});
		
		var IncomeCollectionView = Backbone.Marionette.CompositeView.extend({
			template: '#income_list_view',
			id:'incomelist',
			tagName: 'table',
			className: 'table table-striped table-condensed table-hover table-bordered',
			itemView: IncomeView,	
			initialize: function(){
				this.bindTo(this, 'itemview:remove:model', this.modelDeleted);
			},
			
			modelDeleted: function(view){
				console.log('removed view');
				this.collection.remove(view.model);
				this.display();
			},
			
			display: function(model){
				console.log('displaying income');
				this.render();
			},
			
			appendHtml: function(collectionView, itemView){
				  console.log('collection has ' + collectionView.collection.length + ' items');
			    collectionView.$("tbody").append(itemView.el);
			}
		});
	
		var income_subtotal = Backbone.Marionette.ItemView.extend({
			template: '#income_total',
			initialize: function(){
				this.bindTo(this.collection, "add", this.collectionChanged);
				this.bindTo(this.collection, "remove", this.collectionChanged);
				this.bindTo(this.collection, "change", this.collectionChanged);
			},
			
			collectionChanged: function(model){
				console.log('collection changed');
				var total = 0;
				this.collection.models.forEach(function(val){
					total = total + accounting.unformat(val.get('amount'));
				});
	
				console.log('total: ' + total);
				$(this.el).html(accounting.formatMoney(total));
			}
		});
				
		//expenses
			var expense_input = Backbone.Marionette.ItemView.extend({
				template: afford_expense,

				events:{
					'click #expense_submit' : 'addRow',
					'change #expense_name' : 'nameAdded',
					'change #expense_amount' : 'amountAdded',
					'change #expense_frequency': 'freq_changed'
				},
				
				ui:{
					expense_amount: '#expense_amount',
					expense_frequency: 'select#expense_frequency',
					expense_name: '#expense_name',
					expense_amount: '#expense_amount'
				},
				
				triggers:{
					'mouseover #expense_div' : 'expense:focus'
				},
				
				freq_changed: function(e){
					this.ui.expense_amount.attr('placeholder',this.ui.expense_frequency.val() + ' Amount');
				},
				
				nameAdded: function(e){
					console.log(this.ui.expense_name.val() + ' added');
				},

				amountAdded: function(e){
					console.log(this.ui.expense_amount.val() + ' added');
				},

				addRow: function(e){
					e.preventDefault();
					console.log('new expense added');
					var amount = parseFloat(this.ui.expense_amount.val());
					if (this.ui.expense_frequency.val() === 'Yearly'){
						amount = amount / 12;
					} 
					var expense = new Expense({'name': this.ui.expense_name.val(),
					'amount': accounting.formatMoney(amount)});

					this.ui.expense_name.attr('value','');
					this.ui.expense_amount.attr('value', '');
					this.collection.add(expense);
				}
			});

			var Expense = Backbone.Model.extend();

			var ExpenseList = Backbone.Collection.extend({
				model: Expense
			});

			var ExpenseView = Backbone.Marionette.ItemView.extend({
				template: '#expense_item_view',
				tagName: 'tr',
				events: {
					'click tr:hover button.expense_edit' : 'edit',
					'click tr:hover button.expense_edit_done': 'done'
				},
				
				ui: {
						remove_btn: 'tr:hover button.expense_remove',
						edit_btn: 'tr:hover button.expense_edit',
						done_btn: 'tr:hover button.expense_edit_done',
						text_input: 'tr:hover span.txt_input',
						text_cell: 'tr:hover span.txt_cell',
						name_cell: 'tr:hover .name_cell',
						amount_cell: 'tr:hover .amount_cell'
				},
				
				triggers:{
					'click tr:hover button.expense_remove' : 'remove:model'
				},

				edit: function(e){
					e.preventDefault();
					console.log('edit called');
					this.ui.text_input.removeClass('hide');
					this.ui.text_cell.addClass('hide');
					this.ui.done_btn.show();
					this.ui.edit_btn.hide();
					return false;
				},
				
				done: function(e){
					e.preventDefault();
					console.log('edit called');
					this.ui.text_input.addClass('hide');
					this.ui.text_cell.removeClass('hide');
					this.ui.done_btn.hide();
					this.ui.edit_btn.show();
				},
				
				update: function(e){
					e.preventDefault();
					console.log('update called');
					this.model.set({'name': this.ui.name_cell.val(),
					'amount': accounting.formatMoney(this.ui.amount_cell.val()) });
					this.render();
				}
			});

			var ExpenseCollectionView = Backbone.Marionette.CompositeView.extend({
				template: '#expense_list_view',
				id:'expenselist',
				tagName: 'table',
				className: 'table table-striped table-condensed table-hover table-bordered',
				itemView: ExpenseView,

				initialize: function(){
					this.bindTo(this, 'itemview:remove:model', this.modelDeleted);
				},
				
				modelDeleted: function(view){
					console.log('removed view');
					this.collection.remove(view.model);
					this.display();
				},
				
				display: function(model){
					console.log('displaying income');
					this.render();
				},
				
				appendHtml: function(collectionView, itemView){
				    collectionView.$("tbody").append(itemView.el);
				}
			});
			
			var expense_subtotal = Backbone.Marionette.ItemView.extend({
				template: '#expense_total',
				initialize: function(){
					this.bindTo(this.collection, "add", this.collectionChanged);
					this.bindTo(this.collection, "remove", this.collectionChanged);
					this.bindTo(this.collection, "change", this.collectionChanged);
				},

				collectionChanged: function(model){
					console.log('collection changed');
					var total = 0;
					this.collection.models.forEach(function(val){
						total = total + accounting.unformat(val.get('amount'));
					});

					console.log('total: ' + total);
					$(this.el).html(accounting.formatMoney(total));
				}
			});
		
		// ratios
			var DebtRatios = Backbone.Model.extend();
			var DebtView = Backbone.Marionette.ItemView.extend({
				template: afford_ratio,
				
				events:{
					'change #d-to-i-conservative' : 'updateDtoIConservative',
					'change #d-to-i-aggressive' : 'updateDtoIAggressive'
				},
				
				triggers:{
					'mouseover #ratio_div' : 'ratio:focus'
				},
				
				ui:{
					d_to_i_conservative: '#d-to-i-conservative',
					d_to_i_aggressive: '#d-to-i-aggressive'
				},
				
				updateDtoIConservative: function(e){
					this.model.set({'DebtToIncomeConservative' : this.ui.d_to_i_conservative.val()});
					console.log('conservative ratio updated to: ' + this.model.get('DebtToIncomeConservative'));
				},
				
				updateDtoIAggressive: function(e){
					this.model.set({'DebtToIncomeAggressive' : this.ui.d_to_i_aggressive.val()});
					console.log('aggressive ratio updated to:' + this.model.get('DebtToIncomeAggressive'));
				}
			});
			
		// loan assumptions
		var LoanAssumptions = Backbone.Model.extend();
		var LoanView = Backbone.Marionette.ItemView.extend({
			template: loan_tmpl,
			
			events:{
				'change input#interest_rate': 'update_rate',
				'change input#tax_rate': 'update_tax',
				'change input#homeowners_amount' : 'update_homeowners',
				'change input#loan_term' : 'update_term'
			},
			
			triggers:{
				'mouseover #loan_div': 'loan:focus'
			},
			
			ui: {
				interest_rate: '#interest_rate',
				loan_term: '#loan_term',
				tax_rate: '#tax_rate',
				homeowners: '#homeowners_amount'
			},
			
			update_rate: function(){
				this.model.set({'interest_rate': this.ui.interest_rate.val()});
				console.log('interest rate updated');
			},
			
			update_term: function(){
				this.model.set({'term': this.ui.loan_term.val()});
				console.log('term updated');
			},
			
			update_tax: function(){
				this.model.set({'tax_rate': this.ui.tax_rate.val()});
				console.log('tax rate updated');
			},
			
			update_homeowners : function(){
				this.model.set({'homeowners_amount': this.ui.homeowners.val()});
				console.log('homeowners updated');
			}
		});
		
		//Outputs
		var OutputsModel = Backbone.Model.extend();
		var OutputsView = Backbone.Marionette.ItemView.extend({
			template: '#afford_output_tmpl',
			
			initialize: function(options){					
					this.bindTo(this.model, 'change', this.display);
			},
			
			ui:{
				loan_aggressive: '#afford_aggressive_loan',
				loan_conservative: '#afford_conservative_loan',
				aggressive_pmt: 'td#afford_aggressive_pmt',
				conservative_pmt: '#afford_conservative_pmt',
				aggressive_taxes: '#afford_aggressive_taxes',
				conservative_taxes: '#afford_conservative_taxes',
				aggressive_total: '#afford_aggressive_total',
				conservative_total: '#afford_conservative_total'
			},
			
			display: function(){
				console.log('outputs displayed');

			 	this.ui.loan_aggressive.html(this.model.get('loan_aggressive'));
				this.ui.loan_conservative.html(this.model.get('loan_conservative'));
			  this.ui.aggressive_pmt.html(this.model.get('payment_aggressive'));
				this.ui.conservative_pmt.html(this.model.get('payment_conservative'));
				this.ui.aggressive_taxes.html(this.model.get('taxes'));
				this.ui.conservative_taxes.html(this.model.get('taxes'));
				this.ui.aggressive_total.html(this.model.get('total_aggressive'));
				this.ui.conservative_total.html(this.model.get('total_conservative'));

			}	
		});
			
		AffordLayout.Sidebar = sidebar;
		AffordLayout.income_input = income_input;
		AffordLayout.Income = Income;
		AffordLayout.IncomeList = IncomeList;
		AffordLayout.IncomeView = IncomeView;
		AffordLayout.income_table = IncomeCollectionView;
		AffordLayout.income_subtotal = income_subtotal;
		AffordLayout.expense_input = expense_input;
		AffordLayout.Expense = Expense;
		AffordLayout.ExpenseList = ExpenseList;
		AffordLayout.ExpenseView = ExpenseView;
		AffordLayout.expense_table = ExpenseCollectionView;
		AffordLayout.expense_subtotal = expense_subtotal;
		AffordLayout.DebtRatios = DebtRatios;
		AffordLayout.debt_view = DebtView;
		AffordLayout.LoanAssumptions = LoanAssumptions;
		AffordLayout.LoanView = LoanView;
		AffordLayout.OutputsModel = OutputsModel;
		AffordLayout.OutputsView = OutputsView;
		return AffordLayout;
	});