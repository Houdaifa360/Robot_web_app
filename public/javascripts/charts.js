// Limiting Values before Alarm
const maxTemp = 31
const maxFlame = 12
const maxGas = 2.5

// Counters
var cc1 = 50
var cc2 = 50
var cc3 = 50

const ros = new ROSLIB.Ros({
    url: 'ws://localhost:9090'  // Replace with your ROSbridge server URL
});

ros.on('connection', () => {
    console.log('Connected to ROS');
});

ros.on('error', (error) => {
    console.error('Error connecting to ROS:', error);
    res.status(500).send('Error connecting to ROS');
});

ros.on('close', () => {
    console.log('Disconnected from ROS');
});

// Create Topics
const gastopic = new ROSLIB.Topic({
    ros: ros,
    name: '/gas',  
    messageType: 'std_msgs/String' 
});
const flametopic = new ROSLIB.Topic({
    ros: ros,
    name: '/flame',  
    messageType: 'std_msgs/String' 
});
const temptopic = new ROSLIB.Topic({
    ros: ros,
    name: '/temp',  
    messageType: 'std_msgs/String' 
});
const relaytopic = new ROSLIB.Topic({
    ros: ros,
    name: '/relay',  
    messageType: 'std_msgs/Int16' 
});

// Get Sensors Data
gastopic.subscribe(function (message) {
    const obj = JSON.parse(message.data)
    updateGas(obj.co, obj.lpg, obj.ch4)
});
flametopic.subscribe(function (message) {
    const obj = JSON.parse(message.data)
    updateFlame(obj.flame)
});
temptopic.subscribe(function (message) {
    const obj = JSON.parse(message.data)
    updateTemp(obj.temp)
});

// Publish Relay state ON / OFF
function publishRelayOn() {
    var On = new ROSLIB.Message({data: 1});
    relaytopic.publish(On);
}
function publishRelayOff() {
    var Off = new ROSLIB.Message({data: 0});
    relaytopic.publish(Off);
}

google.charts.load('current', { packages: ['corechart','line'] });
google.charts.setOnLoadCallback(drawChart);

// Draw Sensors charts
function drawChart() {
    drawTemp()
    drawGas()
    drawFlame()
}
function drawTemp() {
    // Set Data
    dataT = new google.visualization.DataTable();
    dataT.addColumn('number', 'Time');
    dataT.addColumn('number', '°C');
    for (let i=0; i < 50; i++) {
        dataT.addRows([[i, 10]])
    }
    // Set Options
    optionsT = {
        legend: 'none',
        chartArea: {'width': '90%', 'height': '85%'},
        vAxis: {
            viewWindow: {
                min: 0,
                max: 80
            }
        }
    };
    // Draw
    chartT = new google.visualization.LineChart(document.getElementById('temp'));
    chartT.draw(dataT, optionsT);
}
function drawGas() {
    // Set Data
    dataG = new google.visualization.DataTable();
    dataG.addColumn('number', 'X');
    dataG.addColumn('number', 'CO');
    dataG.addColumn('number', 'LPG');
    dataG.addColumn('number', 'CH4');
    for (let i=0; i < 50; i++) {
        dataG.addRows([[i, 0.1, 0.1, 0.1]])
    }

    // Set Options   
    optionsG = {
        chartArea: {'width': '90%', 'height': '85%'},
        colors: ['#130f40', '#6ab04c', '#e056fd'],
        vAxis: {
            viewWindow: {
                min: 0,
                max: 10
            }
        }
    };

    // Draw
    chartG = new google.visualization.LineChart(document.getElementById('gas'));
    chartG.draw(dataG, optionsG);
}
function drawFlame() {
    // Set Data
    dataF = new google.visualization.DataTable();
    dataF.addColumn('number', 'Time');
    dataF.addColumn('number', 'Fire');
    for (let i=0; i < 50; i++) {
        dataF.addRows([[i, 2]])
    }
    // Set Options
    optionsF = {
        legend: 'none',
        chartArea: {'width': '90%', 'height': '85%'},
        vAxis: {
            viewWindow: {
                min: 0,
                max: 10
            }
        }
    };
    // Draw
    chartF = new google.visualization.LineChart(document.getElementById('flame'));
    chartF.draw(dataF, optionsF);
}

// Update Sensors Data
function updateTemp(val) {
    if(val > maxTemp) {
        alarmOn('High Temperature Detected > ' + maxTemp + '°C')
    }
    
    // Assuming the response is in the format of an array of [time, value] pairs
    var data = [cc1, val]
    cc1++

    // Update the chart data
    dataT.removeRows(0,1)
    dataT.addRows([data])

    // Draw the chart with updated data
    chartT.draw(dataT, optionsT);
}
function updateFlame(val) {
    if(val > maxFlame) {
        alarmOn('Flame Detected > ' + maxFlame)
    }

    var data = [cc2, val]
    cc2++
    
    dataF.removeRows(0,1)
    dataF.addRows([data])

    chartF.draw(dataF, optionsF);
}
function updateGas(co, lpg, ch4) {
    if(co > maxGas || lpg > maxGas || ch4 > maxGas) {
        alarmOn('Gas Leak Detected > ' + maxGas + 'ppm')
    } else if (co < maxGas && lpg < maxGas && ch4 < maxGas) {
        alarmOff()
    }
    
    var data = [cc3, co, lpg, ch4]
    cc3++

    // Update the chart data
    dataG.removeRows(0,1)
    dataG.addRows([data])

    // Draw the chart with updated data
    chartG.draw(dataG, optionsG);
}

// Turn ON Alarm
function alarmOn(text) {
    $('#alarm').addClass('on')
    $('#alarm .det').html(text)
}
// Turn OFF Alarm
function alarmOff() {
    $('#alarm').removeClass('on')
    $('#alarm .det').html('')
}

// Alarm Click Off
$('#alarmOff').click(function () { 
    alarmOff()
});


// Start & Stop ON/OFF Counter
function startCounter() {
    var hours = 0;
    var minutes = 0;
    var seconds = 0;

    $("#power").addClass('on')
    document.getElementById("robot_status").innerHTML = "Robot is ON";
  
    startInt = setInterval(function() {
      seconds++;
  
      if (seconds == 60) {
        seconds = 0;
        minutes++;
  
        if (minutes == 60) {
          minutes = 0;
          hours++;
        }
      }
  
      var hourString = hours.toString();
      var minuteString = minutes.toString();
      var secondString = seconds.toString();
  
      if (hours < 10) {hourString = "0" + hourString;}
      if (minutes < 10) {minuteString = "0" + minuteString;}
      if (seconds < 10) {secondString = "0" + secondString;}
  
      var timeString = hourString + ":" + minuteString + ":" + secondString;
  
      document.getElementById("timer").innerHTML = timeString;
    }, 1000);
}
function stopCounter() {
    var timeString =  "00:00:00";
    clearInterval(startInt);
    document.getElementById("timer").innerHTML = timeString;
    document.getElementById("robot_status").innerHTML = "Robot is OFF";
    $("#power").removeClass('on')
}
startCounter()

// Shutdown Click
$("#shutdown").on("click", function() {
    stopCounter()
    $("#poweron").show()
    $(this).hide()
    publishRelayOff()
})

// Power On Click
$("#poweron").on("click", function() {
    $("#shutdown").show()
    $(this).hide()
    startCounter()
    publishRelayOn()
})