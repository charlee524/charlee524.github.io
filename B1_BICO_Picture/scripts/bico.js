function bico(){
	console.log('BICO got title bar menu selection: ');
	
}

let bicoData =[{
		index: "1. ",
		heading: "BI Company Primer: AT&T",
		scrollTop: 0
    }, {
	    index: "2. ",
		heading: "AT&T Seeks to Leverage Cross-Selling Opportunity With DirecTV",
		scrollTop: 680
    }, {
    	index: "3. ",
		heading: "Prepaid Subscriber Base Weighs on AT&T's Wireless Ebitda Margin",
		scrollTop: 1187
	}, {
		index: "4. ",
		heading: "Pressure on AT&T Wireless Growth May Abate as Annual Comps Ease",
		scrollTop: 1678
	}, {
		index: "5. ",
		heading: "AT&T Focused on DirecTV Integration, Stabilization: 2Q Review",
		scrollTop: 2180
	}, {
		index: "6. ",
		heading: "Wireless and Strategic Services Drive AT&T Business Solutions",
		scrollTop: 2807
	}, {
		index: "7. ",
		heading: "While AT&T's Business Wireless ARPU Is Lower, So Is Churn Rate",
		scrollTop: 3163
	}, {
		index: "8. ",
		heading: "AT&T Leverages Its Scale to Deliver Integrated Telecom Services",
		scrollTop: 3564
	}, {
		index: "9. ",
		heading: "Legacy Voice, DSL Internet Services Weigh on AT&T Wireline Gains",
		scrollTop: 3975
	}, {
		index: "10. ",
		heading: "AT&T Has 39 Million Reasons to Cross-Sell a Promotional Bundle",
		scrollTop: 4328
	}, {
		index: "11. ",
		heading: "Saturation, Competitive Challenges May Curb AT&T Wireless Growth",
		scrollTop: 4788
	}, {
		index: "12. ",
		heading: "AT&T's Response to T-Mobile Pressures Wireless Services Growth",
		scrollTop: 5169
	}, {
		index: "13. ",
		heading: "Connected Cars, Tablets Are Central to AT&T Boosting Wireless",
		scrollTop: 5550
	}, {
		index: "14. ",
		heading: "AT&T's Wireless Expansion Into Mexico Marks Big Strategic Move",
		scrollTop: 5769
	}, {
		index: "15. ",
		heading: "AT&T Spectrum Bill at $18.2 Billion Building Mobile Video Pipe",
		scrollTop: 6017
	}, { // Financial Review
	    index: "",
		heading: "Financial Review",
		scrollTop: 640
    }, { // Key Topic
		index: "",
		heading: "Key Topic",
		scrollTop: 2745
	}, 
       
];

function updateMenutron(bitNum){
	console.log("[update Menutron] bitNum",bitNum);
	//console.log(window.event.target);
	//console.log(document.querySelector('a[name="chap5"]').offsetTop);
	
	if (bitNum === 20){
		bitNum = 2;
		document.querySelector('.b1-bico-scroll').scrollTop = bicoData[bitNum-1].scrollTop-10;
	}
	else if (bitNum === 60){
		bitNum = 6;
		document.querySelector('.b1-bico-scroll').scrollTop = bicoData[bitNum-1].scrollTop-20;
	}
	
	else {
		console.log("else updateMenutron bicoData[bitNum-1].scrollTop:",bicoData[bitNum-1].scrollTop);
		document.querySelector(".b1-bico-scroll").scrollTop = bicoData[bitNum-1].scrollTop;
	}
	document.getElementById("menutronComboLabel").innerHTML= bitNum+  " of 15";
	document.getElementById("anchor-index").innerHTML= bicoData[bitNum-1].index;
	document.getElementById("anchor-heading").innerHTML= bicoData[bitNum-1].heading;
	
}

function handleScroll(event){
	let index=0;
	console.log("*event.target.scrollTop:",event.target.scrollTop);
	
	if ((event.target.scrollTop >= 0) && (event.target.scrollTop < 639)) index = 0;
	else if (event.target.scrollTop >= 639 && event.target.scrollTop < 655) index = 15;
	else if (event.target.scrollTop >= 655 && event.target.scrollTop < 1176) index = 1; 
	
	else if (event.target.scrollTop >= 1186 && event.target.scrollTop < 1653) index = 2;
	else if (event.target.scrollTop >= 1653&& event.target.scrollTop < 2180) index = 3;
	else if (event.target.scrollTop >= 2180 && event.target.scrollTop < 2744) index = 4;
	else if (event.target.scrollTop >= 2744 && event.target.scrollTop < 2770) index = 16;
	else if (event.target.scrollTop >= 2770 && event.target.scrollTop < 3163) index = 5;
	
	else if (event.target.scrollTop >= 3163 && event.target.scrollTop < 3564) index = 6;
	else if (event.target.scrollTop >= 3564 && event.target.scrollTop < 3975) index = 7;
	else if (event.target.scrollTop >= 3975 && event.target.scrollTop < 4328) index = 8;
	else if (event.target.scrollTop >= 4328 && event.target.scrollTop < 4788) index = 9;
	else if (event.target.scrollTop >= 4788 && event.target.scrollTop < 5169) index = 10;
	else if (event.target.scrollTop >= 5169 && event.target.scrollTop < 5550) index = 11;
	else if (event.target.scrollTop >= 5550 && event.target.scrollTop < 5768) index = 12;
	else if (event.target.scrollTop >= 5768 && event.target.scrollTop < 6016) index = 13;
	else if (event.target.scrollTop >= 6016) index = 14;
	//document.getElementsByClassName("anchor-heading")[0].innerHTML= bicoData[index].index + bicoData[index].heading;
	console.log("*index",index);
	if (index <= 14){
		document.getElementById("menutronComboLabel").innerHTML= (index+1) +" of 15";
		document.getElementById("anchor-index").innerHTML= bicoData[index].index ;
		document.getElementById("anchor-heading").innerHTML= bicoData[index].heading;
		document.getElementById("anchor-index").style.paddingLeft = "10px"; 
	}
	else {
		if (index === 15){
			document.getElementById("menutronComboLabel").innerHTML= (index-13) +" of 15";
		}
		else if (index === 16){
			document.getElementById("menutronComboLabel").innerHTML= (index-10) +" of 15";
		}
		document.getElementById("anchor-index").innerHTML= "";
		document.getElementById("anchor-index").style.paddingLeft = "2px";
		document.getElementById("anchor-heading").innerHTML= bicoData[index].heading;
	}
	
	//console.log("[handle scroll]",event.target.scrollTop, " index:",index," menutron combo:",document.getElementById("menutronComboLabel").innerHTML);
}
function updateMenuLeft(direction){
	console.log("direction:",direction);
	if (direction === "left"){
		console.log("A inside direction:",direction);
		// hide index
		//document.getElementsByClassName("anchor-index")[0].style.display = "none";
		document.getElementById("anchor-heading-row").style.flexDirection = "row-reverse";
		document.getElementById("anchor-heading-row").style.WebkitFlexDirection  = "row-reverse";
		
		document.getElementById("anchor-index").style.display = "none";
		
		
		document.getElementById('menutronCombo').classList.add('left-menu');
	    document.getElementById('menutronComboDropDownContainer').classList.add('left-menu');
		document.getElementById("menutronCombo").style.paddingLeft = "1px";
		document.getElementById("menutronComboLabel").style.paddingLeft = "5px";
	}
	else {
		console.log("B inside direction:",direction);
		document.getElementById("anchor-heading-row").style.flexDirection = "row";
		document.getElementById("anchor-heading-row").style.WebkitFlexDirection  = "row";
		
		document.getElementById("anchor-index").style.display = "block";
		
		document.getElementById('menutronCombo').classList.remove('left-menu');
	    document.getElementById('menutronComboDropDownContainer').classList.remove('left-menu');
	    
		document.getElementById("menutronCombo").style.paddingLeft = "10px";
		console.log("***");
		console.log("display:",document.getElementById("anchor-index").style.display);
	}
	
}
