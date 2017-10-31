var rectSender = [];
var rectReceiver = [];	
var senderFrame = [];
var receiverFrame = [];
var receivedData = [];
var acknowlegedData = [];
var retransmit = [];
var TimeOut = [];
var timeoutText = [];
var timer = [];
var senderWindow;
var receiverWindow;
var text = [];
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
									timeoutText[i] = "";
								}
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
		var Timeout = getTimeout()/1000;
		var e2eDelay = getE2EDelay()/1000;
		var c = 0;
		var time = [];
		var i = 0;
		
		timer = {}
		var limit = getWindowSize();

		view.onFrame = function (event)
		{	
			for(i=0;i<limit;i++)
			{
				if(isInside(c+i))
				{
					if(senderFrame[c+i].position.y == 25)
					{ 
						timer[c+i] = Timeout;
						timeoutText[c+i].fillColor = "black"; 
						timeoutText[c+i].content = timer[c+i];
						time[c+i] = event.time;
					}
					
					if(Math.random() <= 0.95 && senderFrame[c+i].position.y < 285 && acknowlegedData[c+i] == 0)
						senderFrame[c+i].position.y += 4.333/e2eDelay;

					if(receivedData[c+i] == 0 && senderFrame[c+i].position.y >= 285) //received for the first time
					{
						senderFrame[c+i].fillColor = "white";
						rectReceiver[c+i].fillColor = "#000055";
						receiverFrame[c+i].fillColor = "green";
						receivedData[c+i] = 1;
						moveReceiverWindow(c+i);
					}
					
					if( Math.random() <= 0.95 && acknowlegedData[c+i] == 0 && receivedData[c+i] == 1 && receiverFrame[c+i].position.y > 25 )
					{
						receiverFrame[c+i].position.y -= 4.333/e2eDelay;
					}
					
					if((event.time - time[c+i]) <= Timeout && acknowlegedData[c+i] == 0 && receiverFrame[c+i].position.y <= 25  )
					{
						acknowlegedData[c+i] = 1;
						rectSender[c+i].fillColor = "yellow";
						moveSenderWindow(c+i);
						receiverFrame[c+i].remove();
						senderFrame[c+i].remove();							
						timeoutText[c+i].strokeColor = "white";
						timeoutText[c+i].fillColor = "white";
						var allDone = 1;
						if(i > 0)
						{
							for(var q = i+c;q>=c;q--)
							{
								if(acknowlegedData[q] != 1)
								{
									allDone = 0;
									break;
								}
							}
							if(allDone == 1)
							{
								c += i+1;
								i = -1;
							}
						}
						else 
						{
							c++;
							i = -1;
						}
						time[c+i] = event.time;
					}			
					else if(acknowlegedData[c+i] == 0 && (event.time - time[c+i]) > Timeout && receiverFrame[c+i].position.y <= 25)
					{
						senderFrame[c+i].position.y = 25;
						receiverFrame[c+i].position.y = 285;
						senderFrame[c+i].fillColor = "#00adef";
						retransmit[c+i] = 1;
						time[c+i] = event.time;
					}
					if(event.time - time[c+i] > Timeout && (senderFrame[c+i].position.y<285 || receiverFrame[c+i].position.y > 25 ))
					{
						senderFrame[c+i].position.y = 25;
						senderFrame[c+i].fillColor = "#00adef";
						rectReceiver[c+i].fillColor = "#000055";
						receiverFrame[i].position.y = 285;
						if(retransmit[c+i] == 0 && receivedData[c+i] == 0)
							receiverWindow.position.x += 30;
						receivedData[c+i] = 0;
						retransmit[c+i] = 1;
						time[c+i] = event.time;						
					}
					if(i>46)
					{
						event.stop();
					}
					timer[c+i] = timer[c+i] - 0.01667;
					timeoutText[c+i].content = timer[c+i].toFixed(2);
				}
			
			
			}	
		}
	}

	moveSenderWindow = function (packetNo)
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
	
	moveReceiverWindow = function(packetNo)
	{
		for(var m=0; m<46; m++)
			if(receivedData[m] == 0)
				break;
		
		if(getWindowSize() == 4)
			receiverWindow.position.x = (m-1)*30 + 115;
		else if(getWindowSize() == 3)
			receiverWindow.position.x = (m-1)*30 + 100;
		else if(getWindowSize() == 2)
			receiverWindow.position.x = (m-1)*30 + 85;
		else if(getWindowSize() == 1)
			receiverWindow.position.x = (m-1)*30 + 70;

	}
	
	isInside = function(packetNo)
	{
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
		rectSender = [];
		rectReceiver = [];
		senderFrame = [];
		receiverFrame = [];
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

function startStop()
{
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

