define(['accounting'], function(accounting){
	var ConstPayment = function(){
			var prefs = {};
		return {
				init: function(details){
					prefs.loanAmount = details.loanAmount;
					prefs.interestRate = details.interestRate;
					prefs.term = details.term;
					prefs.extraPrincPaymentPerMonth = details.extraPrincPaymentPerMonth;
					
					this.createBaseAmortizationSchedule();
					this.createAmortizationSchedule();
					prefs.baseInterestSaved = this.determineBaseTotalInterestPaid() - this.determineTotalInterestPaid();
					prefs.payoffYr = this.determinePayOffYear();
				},
				
				getAmortizationSchedule : function(){
					return prefs.amortSched;
				},
				
				calcTotalPayment : function(details){
					var begBal = details.begBal || 0,
					interestRate = details.interestRate || 0.06,
					term = details.term || 30;
					
					return (begBal * interestRate / 12)/(1 - Math.pow(1 + interestRate / 12, -12 * term));
				},
				
				createAmortizationSchedule : function(){
					var i,
					cnt = prefs.term * 12, 
					amortSched = [cnt];

					for(i = 0; i < cnt; i+= 1){
						amortSched[i] = {};
						if(i > 0){
							amortSched[i].begBal = amortSched[i-1].endBal;
						}
						else{
							amortSched[i].begBal = prefs.loanAmount;
						}
						amortSched[i].totalPayment = Math.round(1000 * this.calcTotalPayment(
							{begBal: prefs.loanAmount, interestRate: prefs.interestRate, term: prefs.term})) / 1000;
						amortSched[i].interestPayment = Math.round(1000 * ((prefs.interestRate / 12) * amortSched[i].begBal))/ 1000;
						amortSched[i].principalPayment = Math.round(1000 *(amortSched[i].totalPayment - amortSched[i].interestPayment))/ 1000;
						amortSched[i].extraPrincPayment = prefs.extraPrincPaymentPerMonth || 0;
						if(Math.round(1000 *(amortSched[i].begBal - amortSched[i].principalPayment - amortSched[i].extraPrincPayment))/1000 > 0){
							amortSched[i].endBal = Math.round(1000 *(amortSched[i].begBal - amortSched[i].principalPayment - amortSched[i].extraPrincPayment))/1000;
						}
						else{
							amortSched[i].endBal = 0;
						}
					}

					prefs.amortSched = amortSched;
				},
				
				createBaseAmortizationSchedule: function(){
					var i,
					cnt = prefs.term * 12, 
					amortSched = [cnt];

					for(i = 0; i < cnt; i+= 1){
						amortSched[i] = {};
						if(i > 0){
							amortSched[i].begBal = amortSched[i-1].endBal;
						}
						else{
							amortSched[i].begBal = prefs.loanAmount;
						}
						amortSched[i].totalPayment = Math.round(1000 * this.calcTotalPayment(
							{begBal: prefs.loanAmount, interestRate: prefs.interestRate, term: prefs.term})) / 1000;
						amortSched[i].interestPayment = Math.round(1000 * ((prefs.interestRate / 12) * amortSched[i].begBal))/ 1000;
						amortSched[i].principalPayment = Math.round(1000 *(amortSched[i].totalPayment - amortSched[i].interestPayment))/ 1000;
						amortSched[i].extraPrincPayment = 0;
						if(Math.round(1000 *(amortSched[i].begBal - amortSched[i].principalPayment - amortSched[i].extraPrincPayment))/1000 > 0){
							amortSched[i].endBal = Math.round(1000 *(amortSched[i].begBal - amortSched[i].principalPayment - amortSched[i].extraPrincPayment))/1000;
						}
						else{
							amortSched[i].endBal = 0;
						}
					}

					prefs.baseAmortSched = amortSched;
				},

				determineTotalInterestPaid : function(){
					var interest = 0;

					prefs.amortSched.forEach(function(row){
						interest += row.interestPayment || 0;
					});

					return interest;
				},

				determineBaseTotalInterestPaid : function(){
					var interest = 0;

					prefs.baseAmortSched.forEach(function(row){
						interest += row.interestPayment || 0;
					});

					return interest;
				},

				determinePayOffYear : function(){
					var i, yr;
					for(i = 0; i < prefs.amortSched.length; i += 1){
						if(prefs.amortSched[i].endBal === 0){
							yr = (i+1) / 12;
							return yr;
						}
					}
				}
			};
		};
		
		return ConstPayment;
});