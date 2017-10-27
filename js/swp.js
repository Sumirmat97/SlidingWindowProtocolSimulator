<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
		
		<title>Sliding Window Protocol</title>

		<!-- Bootstrap -->
		<link href="css/bootstrap.min.css" rel="stylesheet">
		
		<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
		<script src="js/jquery.min.js"></script>
		
		<!-- Include all compiled plugins (below), or include individual files as needed -->
		<script src="js/bootstrap.min.js"></script>
		<script src="js/swp.js"></script>
		
		 <link href="css/swp.css" rel="stylesheet">

		 <script type="text/javascript" src="js/paper-full.min.js"></script>

		<script type="text/javascript" >
			var rectSender = {};
			var rectReceiver = {};	
			var senderFrame = {};
			var receiverFrame = {};
			var receivedData = {};
			var acknowlegedData = {};
			var retransmit = {};
			var TimeOut = {};
 			var timeoutText = {};
			var timer = {};
			var senderWindow;
			var receiverWindow;
			var text = {};
			var i=0;

			paper.install(window);
			window.onload = function() {
			
				getE2EDelay = function(){ return parseInt(document.getElementById('e2edelay').value); }
				setE2EDelay = function(){ document.getElementById('e2edelay2').value = getE2EDelay(); }
				getTimeout = function(){ return parseInt(document.getElementById('timeout').value); }
				setTimeOut = function(){ document.getElementById('timeout2').value = getTimeout(); }
				getlengthReceiverContainer = function() { return parseInt(document.getElementById('receiverContainer').offsetWidth);}
				getHeightOfDisplay = function() { return parseInt(document.getElementById('display').clientHeight);}
				getlengthOfContainer = function() { return parseInt(document.getElementById('displayCanvas').offsetWidth);}
				getSequenceNumber = function(){ var sws = getWindowSize(); return (sws)*2; }
				initArray = function() {
											for(i=0;i<47;i++) 
											{
												receivedData[i] = 0;
												acknowlegedData[i] = 0;
												retransmit[i] = 0;
												TimeOut[i] = 0;
											}
										}	
										
				function sleep(ms) {
									  return new Promise(resolve => setTimeout(resolve, ms));
									}
				setE2EDelay();
				setTimeOut();

				getWindowSize = function() { return parseInt(document.getElementById('windowSize').value); }
				setWindowWidth = function() 
				{ 
						windowSize.width = getWindowSize() * 30;  
						
						displayPackets();
						senderWindow.remove();
						senderWindow = new Path.Rectangle(new Point(25,7),windowSize);
						senderWindow.strokeColor = "red";
						receiverWindow.remove();
						receiverWindow = new Path.Rectangle(new Point(25,267),windowSize);
						receiverWindow.strokeColor = "red";
				}
											
				start = function()
				{
					startText.remove();
					for(i=0;i<4;i++)
					{
						startTransition(i);
					}
					
				}

					startTransition = function(j) 
					{	
						var Timeout = getTimeout()/1000;
						var e2eDelay = getE2EDelay()/1000;
						//console.log(Timeout);
						var packet = [];   
						var c = 0;
						var time = {};
						var i = 0;
						
						timer = {}
						var limit = getWindowSize();
					
						view.onFrame = function (event)
						{
							for(i=4*j; i< 4*j + 4; i++)
							{
								//console.log(receiverFrame[i].position.y + i.toString());
								if(isInside(i))
								{//console.log(senderFrame[0].position.y);
									if(senderFrame[i].position.y == 25)
									{ 
										timer[i] = Timeout;
										timeoutText[i].fillColor = "black"; 
										timeoutText[i].content = timer[i];
										time[i] = event.time;
									}
									
									if(senderFrame[i].position.y < 285 && acknowlegedData[i] == 0)
										senderFrame[i].position.y += 4.633/e2eDelay;

									if(receivedData[i] == 0 && senderFrame[i].position.y >= 285) //received for the first time
									{
										if(retransmit[i] == 0)
											receiverWindow.position.x += 30;
										senderFrame[i].fillColor = "white";
										rectReceiver[i].fillColor = "#000055";
										receiverFrame[i].fillColor = "green";
										receivedData[i] = 1;
									}
									
									if(acknowlegedData[i] == 0 && receivedData[i] == 1 && receiverFrame[i].position.y > 25 )
									{
										receiverFrame[i].position.y -= 4.633/e2eDelay;
									}
									
									if(acknowlegedData[i] == 0 && receiverFrame[i].position.y <= 25 && (event.time - time[i]) <= Timeout)
									{
										console.log("dasd");
										acknowlegedData[i] = 1;
										rectSender[i].fillColor = "yellow";
										moveSenderWindow(i);
										receiverFrame[i].remove();
										senderFrame[i].remove();							
										timeoutText[i].strokeColor = "white";
										timeoutText[i].fillColor = "white";
										i++;
										time[i] = event.time;
										
									}			
									else if(acknowlegedData[i] == 0 && (event.time - time[i]) > Timeout && receiverFrame[i].position.y <= 25)
									{
										senderFrame[i].position.y = 25;
										receiverFrame[i].position.y = 285;
										receivedData[i] = 0;
										senderFrame[i].fillColor = "#00adef";
										retransmit[i] = 1;
										time[i] = event.time;
									}
									if(event.time - time[i] > Timeout && (senderFrame[i].position.y<285 || receiverFrame[i].position.y > 25 ))
									{
										senderFrame[i].position.y = 25;
										senderFrame[i].fillColor = "#00adef";
										rectReceiver[i].fillColor = "#000055";
										receiverFrame[i].position.y = 285;
										if(retransmit[i] == 0 && receivedData[i] == 0)
											receiverWindow.position.x += 30;
										receivedData[i] = 0;
										retransmit[i] = 1;
										time[i] = event.time;						
									}
									if(i>46)
									{
										event.stop();
									}
									timer[i] = timer[i] - 0.01667; 
									timeoutText[i].content = timer[i].toFixed(2);
									
								}
							}
						}		
					}
				moveSenderWindow = function (packetNo)
				{ 
					//if(getWindowSize == 1)
					{
						for(var m=0; m<46; m++)
							if(acknowlegedData[m] == 0)
								break;
						if(getWindowSize() == 4)
							senderWindow.position.x = (m-1)*30 + 115;
						else if(getWindowSize() == 3)
							senderWindow.position.x = (m-1)*30 + 100;
						else if(getWindowSize() == 2)
							senderWindow.position.x = (m-1)*30 + 85;
						else if(getWindowSize() == 1)
							senderWindow.position.x = (m-1)*30 + 70;
					}
				}
				
				isInside = function(packetNo){
					//console.log(packetNo);
					if(senderFrame[packetNo].position.x < senderWindow.position.x || senderFrame[packetNo].position.x - 60 <senderWindow.position.x)
						return true;
					else 
						return false;
				
				}
				paper.setup('displayCanvas');
				var size = new Size (20,30);
				var windowSize = new Size(30,36);
	
				displayPackets = function()
				{
					rectSender = {};
					rectReceiver = {};
					senderFrame = {};
					receiverFrame = {};
					initArray();
					
					var length = getlengthOfContainer();
					var counter = 0;
					var sNo = 0;
					var seqNo = getSequenceNumber();
					for(i=30; i<length-30; i+=30)
					{
						
						timeoutText[counter] = new PointText(new Point(i,8));
						timeoutText[counter].strokeColor = "black";
						timeoutText[counter].fontSize = 10;
						
						senderFrame[counter] = new Path.Rectangle(new Point(i,10),size);
						senderFrame[counter].strokeColor = 'black';
						senderFrame[counter].fillColor = '#00adef';
	
						rectSender[counter] = new Path.Rectangle(new Point(i,10),size);
						rectSender[counter].strokeColor = 'black';
						rectSender[counter].fillColor = '#00adef';
						
						text[counter] = new PointText(new Point(i+7,30));
						text[counter].content = sNo++%seqNo;
						text[counter].strokeColor = "black";
						text[counter].size = 40;
					
						receiverFrame[counter] = new Path.Rectangle(new Point(i,270),size);
						receiverFrame[counter].strokeColor = "black";
										
						rectReceiver[counter] = new Path.Rectangle(new Point(i,270),size);
						rectReceiver[counter].strokeColor = "black";
						
						counter++;
					}
				}
				
				displayPackets();		
				windowSize.width = getWindowSize()*30;
				senderWindow = new Path.Rectangle(new Point(25,7),windowSize);
				senderWindow.strokeColor = "red";
				receiverWindow = new Path.Rectangle(new Point(25,267),windowSize);
				receiverWindow.strokeColor = "red";
						
				startText = new PointText(view.center);
				startText.content = "Click On Start To Begin";
				startText.fontSize = 50;
				startText.justification = "center";
				startText.strokeColor = "Black";
				view.draw();
			
			}
			
			function startStop(){
			if ( document.getElementById('button').innerHTML == "Start")	
				{	
					start();
					document.getElementById('button').innerHTML = "Stop";
				}
			else
				{
					stop();
					document.getElementById('button').innerHTML = "Start";
				}
			}
			
			function stop(){location.reload();}

		</script>
		
		
		
	</head>
	
	<body >
		<div class="container-fluid">
			<div class="row">
				<div class="col-md-12" style="text-align:center;">	
					<div class="page-header"><h1>Sliding Window Protocol</h1></div>
				</div>
			</div>
			<div class="row configuration">
				<div class="col-md-3" >	
					 <div class="form-group">
						  <label for="windowSize">Window Size</label>
						  <select class="form-control" id="windowSize" onchange="setWindowWidth()">
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="4" selected>4</option>
						  </select>
					</div> 
				</div>
				<div class="col-md-4" >	
					<label for="e2edelay">End To End Delay</label>
					<input name="e2edelay" value="2000" min="1000" max="10000" step="100" id="e2edelay" onchange="setE2EDelay();" class="temp-disabled" type="range">
					<input class="form-control" id="e2edelay2" disabled="true" type="text">
				</div>
				<div class="col-md-4" >	
					<label for="timeout">Time Out</label>
					<input name="timeout" value="2000" min="1000" max="20000" step="100" id="timeout" onchange="setTimeOut();" class="temp-disabled" type="range">
					<input class="form-control" id="timeout2" disabled="true" type="text">
				</div>
				<div class="col-md-1" style="text-align:center;">
					<button id="button" type="button" class="btn btn-primary" onclick="startStop();" >Start</button>
				</div>
			</div>
			
			
			<div class="row protocol" id="display">
				<div class="col-md-12">
					<canvas id="displayCanvas" resize style="width:100%; height:307px;"></canvas>
				</div>
			</div>
			
			<div class="row legend">
				<div class="col-md-12">
					<h4>Legend</h4>
					<div class="row">
						<div class="col-md-2" style="padding:5px; margin-bottom:5px;">
							<div class="packetSender"></div><span style="margin-left:10%;">Data Buffered</span> 
						</div>
						<div class="col-md-2"  style="padding:5px; margin-bottom:5px;">
							<div class="packetReceiver"></div><span style="margin-left:10%;">No Data Received Yet</span> 
						</div>		
						<div class="col-md-2"  style="padding:5px; margin-bottom:5px;">
							<div class="ack"></div><span style="margin-left:10%;">Acknowledgement</span> 
						</div>
						<div class="col-md-2"  style="padding:5px; margin-bottom:5px;">
							<div class="receivedData"></div><span style="margin-left:10%;">Data Received</span> 
						</div>
						
						<div class="col-md-2"  style="padding:5px; margin-bottom:5px;">
							<div class="ackReceived"></div><span style="margin-left:10%;">Acknowledgement Recieved</span> 
						</div>
						
						<div class="col-md-2"  style="padding:5px; margin-bottom:5px;">
							
						</div>
					</div>
				</div>
			</div>		
		
		</div>
	</body>
</html>