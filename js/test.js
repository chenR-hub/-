var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var w = 50,h = 50;
var moveMap; //当前的地图(移动过的)
var primMap; //当前等级的地图（初始地图）
var iCurLevel = 0; //当前关卡
var curMan; //初始化小人
var moveTime = 0; //小人移动次数
var gameLevel; //完成等级判断
var finshedMaxLevel = 0; //当前完成的最高关卡
var movePath = []; //记录小人行动路径
var boxPath = [];
var goldNum1 = 2000;  //金币数量
var levelNum = document.getElementById("levelNum");
var goldNum = document.getElementById("goldNum");
var moveNum = document.getElementById("moveNum");


// 规则
var ruleText = [
"1.	通过键盘上的上下左右键可以控制小人的移动，当小人前有箱子且",
"箱子后不是箱子或墙时，小人可以将箱子向前移动一格，当小人将箱子",
"均推到蓝色的圆点上时，即为通过此关。" ,
"2. 系统会将你的步数与最优步数比较，然后判断等级。" 
]

//预加载所有图片
var oImgs = {
	"wall": "images/wall.png",
	"box": "images/box.png",
	"box1": "images/box1.png",
	"ball": "images/ball.png",
    "gold": "images/gold.png",
    "block": "images/block.jpg",
    "startBg": "images/background.jpg",
    "down": "images/down.png",
    "ruleBg" : "images/ruleBg.jpg",
    "great" : "images/great.jpg"
}

function imgPreload(srcs, callback) {
	var count = 0,
		imgNum = 0,
		images = {};

	for (src in srcs) {
		imgNum++;
	}

	for (src in srcs) {
		images[src] = new Image();
		images[src].onload = function() {
			//判断是否所有的图片都预加载完成
			if (++count >= imgNum) {
				callback(images);
			}
		}
		images[src].src = srcs[src];
	}
}

var startBg, wall, box, box1, ball, gold, block, hongxiaodou, ruleBg, great;

imgPreload(oImgs, function(images){
	wall = images.wall;
	box = images.box;
	box1 = images.box1;
	ball = images.ball;
	gold = images.jb;
	block = images.block;
	startBg = images.startBg;
	hongxiaodou = images.down;
	ruleBg = images.ruleBg;
	great = images.great;
	initBg();
});

//初始页面
function initBg() {
	context.drawImage(startBg, 0, 0, canvas.width, canvas.height);
	// flag = 0;
	// homeButton.style.display = 'none';
	ruleButton.style.display = 'block';
	startButton.style.display = 'block';
	nextLevelIn.style.display = 'none';
	returnBegin.style.display = 'none';
	replay.style.display = 'none';
	backOne.style.display = 'none';
	directNext.style.display = 'none';
	// zeroArray(boxPath);
	// msg0.style.display = 'none';
	// msg1.style.display = 'none';
	// msg2.style.display = 'none';
	// initLevel(); //初始化对应等级的游戏
	// showMoveInfo(); //显示对应等级的游戏数据（初始化）
}

//开始游戏
function gameBegin(){
	initLevel();
}

//游戏规则
function ruleBegin(){
	context.drawImage(ruleBg, 0, 0, canvas.width, canvas.height);
	for(var i = 0; i < 4; i++) {
		context.font = "18px Microsoft YaHei";
		context.fillText(ruleText[i], 20, 50 + 30 * i);
		startButton1.style.display = 'block';
	}
}

//初始化游戏等级
function initLevel(){
	moveTime = 0; //步数清零
	zeroArray(movePath);
	zeroArray(boxPath);
	showInfo();
	returnBegin.style.display = 'block';
	replay.style.display = 'block';
	backOne.style.display = 'block';
	directNext.style.display = 'block';
	moveMap = copyArray(levels[iCurLevel]);//移动过的关卡地图
	primMap = levels[iCurLevel]; //当前关卡地图
	initFloor(); //初始化地板
	DrawMap(moveMap); //绘制当前等级地图
	nextLevelIn.style.display = 'none';
	showInfo();
}

//小人位置坐标
function Point(x, y){
	this.x = x; 
	this.y = y;
}

var  manPosition = new Point(5, 5); //小人的初始坐标

//绘制每个关卡的游戏地图
function DrawMap(level){
	for(var i = 0; i < level.length; i++)
	{
		for(var j = 0; j < level[i].length; j++)
		{
			var pic;
			if(level[i][j] == 0)
				continue;
			switch(level[i][j])
			{
				case 1: //墙
				     pic = wall;
				     break;
				case 2: //目标位置
				     pic = ball;
				     break;
				case 3:  //箱子
				     pic = box;
				     break;
				case 4:  //小人
				     pic = hongxiaodou;
				     //获取小人的坐标
				     manPosition.x = i;
				     manPosition.y = j;
				     break;
				case 5:  //箱子到达目标
				     pic = box1;
				     break;
			}
			//绘制地图
			context.drawImage(pic, w*j, h*i, w, h);
		}
	}
}

//绘制地板
function initFloor() {
	// for (var i = 0; i < 16; i++) {
	// 	for (var j = 0; j < 16; j++) {
	// 		context.drawImage(block, w * j, h * i, w, h);
	// 	}
	// }
	context.drawImage(block, 0, 0, canvas.width, canvas.height);
}



//下一关
function NextLevel(i){
	iCurLevel = iCurLevel + i;
	if(iCurLevel < 0)
	{
		iCurLevel = 0;
		return;
	}
	if(iCurLevel > levels.length-1)
	{
		iCurLevel = levels.length;
	}
	initLevel(); //绘制当前等级关卡地图
	showInfo(); //初始化当前关卡数据
}

//小人移动
function move(act){
	var p1, p2; //p1——小人移动的目标位置  p2——目标位置的下一个位置
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//细节点：中文和英文不一样
	//一步错步步错，这一步错了导致整个画布都无法显现
	p1 = new Point(manPosition.x, manPosition.y);
	p2 = new Point(manPosition.x, manPosition.y);

	switch(act)
	{
		case "up":
			p1.x = p1.x-1;
			p2.x = p2.x-2;
		    break;
		case "down":
		    p1.x = p1.x+1;
			p2.x = p2.x+2;
		    break;
		case "left":
		    p1.y = p1.y-1;
		    p2.y = p2.y-2;
		    break;
		case "right":
		    p1.y = p1.y+1;
		    p2.y = p2.y+2;
		    break;
	}

    //判断小人是否能移动
	if(canMove(p1, p2))
	{  //能， 更新地图和数据
		movePath[moveTime] = act;  //记录小人移动方向
		moveTime++;
		showInfo();
	}
    
	//重绘地板
	initFloor();
	//重绘当前关卡地图
	DrawMap(moveMap);

	if(Finish())
	{
		goldNum1 = goldNum1 + 3;
		if(finshedMaxLevel <= iCurLevel)
		    finshedMaxLevel = iCurLevel+1;
        setTimeout(function() {greatGame();}, 500);
		// NextLevel(1);
	}
}

//判断小人是否能移动
function canMove(p1, p2) {
	//移动坐标超出地图边界
	if(p1.x < 0) return false;
	if(p1.y < 0) return false;
	if(p1.x > moveMap.length) return false;
	if(p1.y > moveMap.length) return false;
    
    //前面为墙
	if(moveMap[p1.x][p1.y] == 1)
		return false;
	//前面为箱子
	if(moveMap[p1.x][p1.y] == 3 || moveMap[p1.x][p1.y] == 5)
	{
		//箱子前面为箱子或墙——不可移动
		if(moveMap[p2.x][p2.y] == 1 || moveMap[p2.x][p2.y] == 3 || moveMap[p2.x][p2.y] == 5)
		 {
		 	return false;
		 }

        boxPath[moveTime] = 1;  //箱子移动
        if(moveMap[p2.x][p2.y] != 2)
		   //能移动——箱子向前移动一格
		   moveMap[p2.x][p2.y] = 3;
		else
		   moveMap[p2.x][p2.y] = 5;
	} 

	//小人前面为障碍——向前移动一格
	moveMap[p1.x][p1.y] = 4;
	// alert(moveMap[p1.x][p1.y]);

	//更改小人移动前位置
	var n = primMap[manPosition.x][manPosition.y];//初始地图此位置数据

	//如果小人移动前位子不是目标点
	if(n == 2 || n == 5)
		n = 2;
	else
		n = 0;
    
    //更改当前地图数据
	moveMap[manPosition.x][manPosition.y] = n;
	manPosition = p1; //更新小人位置

	return true;
}

function backMove() {
    var flag = 0;  //箱子是否移动
    var x, y;  //当前箱子的位置
	num = moveTime-1;
	//
	if(num >= 0)
	{
		//上一步是右走且有箱子
		if(movePath[num] == "right")
		{
			if(boxPath[num] == 1)
			{
				flag = 1;
				x = manPosition.x;
				y = manPosition.y+1;
				moveMap[manPosition.x][manPosition.y-1] = 4;
				moveMap[manPosition.x][manPosition.y] = 3;
			}
			else
				moveMap[manPosition.x][manPosition.y-1] = 4;
		}
		else if(movePath[num] == "left")
		{
			if(boxPath[num] == 1)
			{
				flag = 1;
				x = manPosition.x;
				y = manPosition.y-1;
				moveMap[manPosition.x][manPosition.y+1] = 4;
				moveMap[manPosition.x][manPosition.y] = 3;
			}
			else
				moveMap[manPosition.x][manPosition.y+1] = 4;
		}
		else if(movePath[num] == "up")
		{
			if(boxPath[num] == 1)
		    {
		    	flag = 1;
		    	x = manPosition.x-1;
				y = manPosition.y;
		    	moveMap[manPosition.x+1][manPosition.y] = 4;
		    	moveMap[manPosition.x][manPosition.y] = 3;
		    }
			else
				moveMap[manPosition.x+1][manPosition.y] = 4;
		}
		else if(movePath[num] == "down")
		{
			if(boxPath[num] == 1)
			{
				flag = 1;
				x = manPosition.x+1;
				y = manPosition.y;
				moveMap[manPosition.x-1][manPosition.y] = 4;
				moveMap[manPosition.x][manPosition.y] = 3;
			}
			else
				moveMap[manPosition.x-1][manPosition.y] = 4;
		}
	    
	    if(flag == 0)
	    {
	    	//更改小人移动前位置
			var n = primMap[manPosition.x][manPosition.y];//初始地图此位置数据

			//如果小人移动前位子不是目标点
			if(n == 2 || n == 5)
				n = 2;
			else
				n = 0;
		    
		    //更改当前地图数据
			moveMap[manPosition.x][manPosition.y] = n;
	    }
	    else
	    {
	    	//更改箱子移动前位置
			var n = primMap[x][y];//初始地图此位置数据

			//如果箱子移动前位子是目标点
			if(n == 2 || n == 5)
				n = 2;
			else
				n = 0;
		    var p = primMap[manPosition.x][manPosition.y];

		    if(p == 2)
		    	n = 5;
		    //更改当前地图数据
			moveMap[x][y] = n;
	    }
		moveTime--;
		showInfo();
		//重绘地板
		initFloor();
		//重绘当前关卡地图
		DrawMap(moveMap);
	}
}

function endLevel() {
	if(iCurLevel != 16)
	{
		// alert(iCurLevel);
		return true;
	}
	else
		return false;
}

function checkGold() {
	// alert("gold")
	if(goldNum1 >= 1)
	{
		goldNum1--;
		return true;
	}
	else
		return false;
}

function checkNext() {
	if(goldNum1 >= 3)
	{
		goldNum1 -= 3;
		return true;
	}
	else
		return false;
}
//检查是否通关
function Finish(){
	for(var i = 0; i < moveMap.length; i++)
	{
		for(var j = 0; j < moveMap[i].length; j++)
		{
			//将移动后的地图与初始地图比较
			//原始地图的目标点有两种情况：2——目标点 5——目标点及箱子
			if(primMap[i][j] == 2 && moveMap[i][j] != 5 || primMap[i][j] == 5 && moveMap[i][j] != 5)
				return false;
		}
	}
	return true;
}

//记录已通关的最高关卡,判断是否已经通关此关卡
function Finished(){
    if(iCurLevel < finshedMaxLevel)
    	return true;
    else 
    	return false;
}

function greatGame() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.drawImage(great, 0, 0, canvas.width, canvas.height);
	directNext.style.display = 'none';
	replay.style.display = 'none';
	backOne.style.display = 'none';
}

function showInfo(){
     levelNum.innerHTML = "第" + (iCurLevel+1) + "/17关";
     moveNum.innerHTML = "移动次数: " + moveTime;
     goldNum.innerHTML = "金币:" + goldNum1;
}

function dokeyDown(event){
	switch(event.keyCode)
	{    //S\W\D\A
		case 37://左键头
      case 65:
				move("left");
				break;
			case 38://上键头
      case 87:
				move("up");
				break;
			case 39://右箭头
      case 68:
				move("right");
				break;
			case 40://下箭头
      case 83:
				move("down");
				break;
	}
}

//二维数组复制函数
function copyArray(arr){
	var b=[];//每次移动更新地图数据都先清空再添加新的地图
		for (var i=0;i<arr.length ;i++ )
		{
			b[i] = arr[i].concat();//链接两个数组
		}
		return b;
}
		

function zeroArray(arr){
    for(var i = 0; i < 50; i++)
    {
    	arr[i] = 0;
    }
}