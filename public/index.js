async function getLatest(){
	const res = await(((await fetch("http://.local:3000/api/v1/all/latest"))).json());

	res.datetime = new Date(res.datetime); //convert to JST
	return res
}

async function getHistory(device, num, unit){
	const res = await(((await fetch(`http://.local:3000/api/v1/${device}/history?past=${num}&unit=${unit}`))).json());

	const minDateTime = new Date(res[0].datetime);
	const maxDateTime = new Date(res[res.length - 1].datetime);

	let data = [];
	res.forEach((elem, index) => {
		let v;
		switch (device){
			case "temperature":
				v = elem.temp; break;
			case "humidity":
				v = elem.humid; break;
			case "pressure":
				v = elem.press; break;
			case "co2":
				v = elem.co2; break;
			default:
				v = 0;
		}

		data[index] = {x: new Date(elem.datetime), y: v}
	});

	return {data:data, min: minDateTime, max: maxDateTime};
}

async function drawChart(){
	const canvasElem = document.getElementById("chart-history");
	const ctx = canvasElem.getContext("2d");
	const radioElems = document.getElementsByName("chart-device");

	canvasElem.classList.add("blink");

	
	let device = "temperature", note = "気温", unit = "℃",gradientStart = "255,158,158", gradientEnd = gradientStart;
	if        (radioElems.item(1).checked){
		device = "humidity"; note = "湿度"; unit = "%RH"
		gradientStart = "158,255,255"; gradientEnd = gradientStart;
	} else if (radioElems.item(2).checked){
		device = "pressure"; note = "気圧"; unit = "hPa"
		gradientStart = "158,255,206"; gradientEnd = gradientStart;
	} else if (radioElems.item(3).checked){
		device = "co2"     ; note = "CO2濃度"; unit = "ppm"
		gradientStart = "206,158,255"; gradientEnd = gradientStart;
	}

	let pastNum = document.getElementById("chart-past-time").value;

	const res = await getHistory(device, pastNum, "hour");

	canvasElem.style.width  = "100%";
	canvasElem.style.height = "200%";
	canvasElem.width = canvasElem.offsetWidth;
	canvasElem.height = canvasElem.offsetHeight * 2;

	if (typeof chartHist !== "undefined" && chartHist){chartHist.destroy();}


	var gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, `rgba(${gradientStart}, .1)`);   
        gradient.addColorStop(1, `rgba(${gradientEnd}, .9)`);

	window.chartHist = new Chart(canvasElem,{
		type: "line",
		data:{
			datasets:[{
				label: note,
				data: res.data,
				fill: true,
				backgroundColor: gradient,
			}]
		},
		options: {
			scales: {
				x:{
					type: "time",
					time: {
						unit: "hour",
						displayFormats:{
							hour: "d HH:mm"
						},
						min: res.min,
						max: res.max,
					},
					title: {
						display: true,
						text: "日時",
					}
				},
				y:{
					title:{
						display: true,
						text: unit,
					},
				}
			}
		}
	})
	canvasElem.classList.remove("blink");
}

async function drawLatestData(){
	function addClass(elems){
		elems.forEach((elem)=>{
			elem.classList.add("blink");
		});
	}
	function removeClass(elems){
		elems.forEach((elem)=>{
			elem.classList.remove("blink");
		});
	}
	const tempElem  = document.getElementById("temp_view");
	const humidElem = document.getElementById("humid_view");
	const pressElem = document.getElementById("press_view");
	const co2Elem   = document.getElementById("co2_view");
	const datetimeElem = document.getElementById("data-datetime");
	elems = new Array(tempElem, humidElem, pressElem, co2Elem, datetimeElem);
	addClass(elems);
	
	const res = await getLatest()

	tempElem.innerHTML  = res.temp.toFixed(1); // 100度とかあり得ない
	humidElem.innerHTML = res.humid >= 100? "100" : res.humid.toFixed(1);
	pressElem.innerHTML = res.press.toFixed() //3ケタはともかく5ケタはない
	co2Elem.innerHTML   = res.co2 >= 10000? "9999" : res.co2.toFixed();
	datetimeElem.innerHTML = "計測: " + res.datetime.toLocaleString();
	removeClass(elems);
}

drawLatestData();
drawChart();

setInterval(() => {
	drawLatestData();
	drawChart();
}, 2 * 60 * 1000);

document.getElementById("chart-past-time").addEventListener("change", ()=>{drawChart();});

