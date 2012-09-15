define(['accounting'], function(accounting){
	var Afford = function(){
		console.log('afford created');
			var prefs = {};
			
		return {
				clearIncomes: function(){
					this.prefs.incomeList = [];
				},
				convertMonthly: function(income){
					return  accounting.unformat(income) / 12;
				},
				calculateMonthlyPayment : function(details){
					var income = details.totalMonthlyIncome || 0,
					debt = details.totalMonthlyDebt || 0,
					debtToIncome = details.debtToIncomeRatio || 0,
					propertyTaxes = details.propertyTaxes || 0,
					homeowners = details.homeOwnersFeesYrly || 0,
					condoFees = details.CondoFees || 0;
					
					var amount = (income *debtToIncome) - debt -  
					(propertyTaxes + homeowners + condoFees)/12;
					return amount;
				},
				
				calculateLoanAmount : function(loan){
					var payment = loan.payment || 0,
					rate = loan.interestRate || 0,
					term = loan.term || 0;
					
					var amount = payment / ((rate / 12) / (1 - Math.pow(1 + rate / 12, -12 * term)));
					return amount;
				}				
				
		};
	};
	
	
	return Afford;
});