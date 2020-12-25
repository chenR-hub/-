ruleButton.onclick = function(e) { // 规则按钮效果
	context.clearRect(0, 0, canvas.width, canvas.height);
	ruleButton.style.display = 'none';
	startButton.style.display = 'none';
	ruleBegin();
}

startButton.onclick = function(e) { // 开始按钮效果
	context.clearRect(0, 0, canvas.width, canvas.height);
	ruleButton.style.display = 'none';
	startButton.style.display = 'none';
	gameBegin(); // 游戏开始
}

startButton1.onclick = function(e) {  //规则页面开始按钮
	context.clearRect(0, 0, canvas.width, canvas.height);
	ruleButton.style.display = 'none';
	startButton.style.display = 'none';
	startButton1.style.display = 'none';
	gameBegin(); // 游戏开始
}

//返回首页
returnBegin.onclick = function(e){
	returnBegin.style.display = 'none';
	initBg();
}

//重玩
replay.onclick = function(e) {
    NextLevel(0);
}

//上一关
last.onclick = function (e) {
	NextLevel(-1);
}

//下一关按钮
next.onclick = function() {
	if(Finish() || Finished())
	  NextLevel(1);
	else
	{
		alert("请先通过当前关卡！");
	}
}

directNext.onclick = function() {
	if(endLevel())
	{
		if(checkNext())
		  NextLevel(1);
		else
		{
			alert("金币不足！");
		}
	}
	else
	{
		alert("已到最后一关")
	}
}

backOne.onclick = function() {
	if(checkGold())
	   backMove();
	else
		alert("金币不足");
}