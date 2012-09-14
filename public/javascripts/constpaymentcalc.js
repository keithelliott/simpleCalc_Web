var prefs = {},
ConstantPmtCalc = module.exports.ConstantPaymentCalculator = ConstantPaymentCalculator;

ConstantPmtCalc.prototype.calcTotalPayment = function(details){
	return (details.begBal * details.interestRate / 12)/(1 - Math.pow(1 + details.interestRate / 12, -12 * details.term));
};

ConstantPmtCalc.prototype.createAmortizationSchedule = function(){
	var i,
	cnt = this.prefs.term * 12, 
	amortSched = [cnt];
	
	for(i = 0; i < cnt; i+= 1){
		amortSched[i] = {};
		if(i > 0){
			amortSched[i].begBal = amortSched[i-1].endBal;
		}
		else{
			amortSched[i].begBal = this.prefs.loanAmount;
		}
		amortSched[i].totalPayment = Math.round(1000 * this.calcTotalPayment(
			{begBal: this.prefs.loanAmount, interestRate: this.prefs.interestRate, term: this.prefs.term})) / 1000;
		amortSched[i].interestPayment = Math.round(1000 * ((this.prefs.interestRate / 12) * amortSched[i].begBal))/ 1000;
		amortSched[i].principalPayment = Math.round(1000 *(amortSched[i].totalPayment - amortSched[i].interestPayment))/ 1000;
		amortSched[i].extraPrincPayment = this.prefs.extraPrincPaymentPerMonth || 0;
		if(Math.round(1000 *(amortSched[i].begBal - amortSched[i].principalPayment - amortSched[i].extraPrincPayment))/1000 > 0){
			amortSched[i].endBal = Math.round(1000 *(amortSched[i].begBal - amortSched[i].principalPayment - amortSched[i].extraPrincPayment))/1000;
		}
		else{
			amortSched[i].endBal = 0;
		}
	}
	
	this.prefs.amortSched = amortSched;
};

ConstantPmtCalc.prototype.createBaseAmortizationSchedule = function(){
	var i,
	cnt = this.prefs.term * 12, 
	amortSched = [cnt];
	
	for(i = 0; i < cnt; i+= 1){
		amortSched[i] = {};
		if(i > 0){
			amortSched[i].begBal = amortSched[i-1].endBal;
		}
		else{
			amortSched[i].begBal = this.prefs.loanAmount;
		}
		amortSched[i].totalPayment = Math.round(1000 * this.calcTotalPayment(
			{begBal: this.prefs.loanAmount, interestRate: this.prefs.interestRate, term: this.prefs.term})) / 1000;
		amortSched[i].interestPayment = Math.round(1000 * ((this.prefs.interestRate / 12) * amortSched[i].begBal))/ 1000;
		amortSched[i].principalPayment = Math.round(1000 *(amortSched[i].totalPayment - amortSched[i].interestPayment))/ 1000;
		amortSched[i].extraPrincPayment = 0;
		if(Math.round(1000 *(amortSched[i].begBal - amortSched[i].principalPayment - amortSched[i].extraPrincPayment))/1000 > 0){
			amortSched[i].endBal = Math.round(1000 *(amortSched[i].begBal - amortSched[i].principalPayment - amortSched[i].extraPrincPayment))/1000;
		}
		else{
			amortSched[i].endBal = 0;
		}
	}
	
	this.prefs.baseAmortSched = amortSched;
};

ConstantPmtCalc.prototype.determineTotalInterestPaid = function(){
	var interest = 0;
	
	this.prefs.amortSched.forEach(function(row){
		interest += row.interestPayment || 0;
	});
	
	return interest;
};

ConstantPmtCalc.prototype.determineBaseTotalInterestPaid = function(){
	var interest = 0;
	
	this.prefs.baseAmortSched.forEach(function(row){
		interest += row.interestPayment || 0;
	});
	
	return interest;
};

ConstantPmtCalc.prototype.determinePayOffYear = function(){
	var i, yr;
	for(i = 0; i < amortSched.length; i += 1){
		if(amortSched[i].endBal === 0){
			yr = (i+1) / 12;
			return yr;
		}
	}
};

function ConstantPaymentCalculator(prefs){
	this.prefs = prefs || {};
	this.createBaseAmortizationSchedule();
	this.createAmortizationSchedule();
	this.prefs.baseInterestSaved = this.determineBaseTotalInterestPaid() - this.determineTotalInterestPaid();
	this.prefs.payoffYr = this.determinePayOffYear();
}

