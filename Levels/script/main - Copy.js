var up, down, left, right, space, shift;
var mouse1, mouse2, mouse3;
var mapUrl = "../assets/terrain/map.png";
var tileSize = 64;

var boundries = "<box>3,-25,3,3</box>";

var stage = new PIXI.Stage(0x66FF99);
var renderer = PIXI.autoDetectRenderer(
    document.getElementById("game-canvas").width,
    document.getElementById("game-canvas").height,
    {view:document.getElementById("game-canvas")}
  );

var speed = 3;
var bulletSpeed = 5;

document.body.appendChild(renderer.view);

requestAnimationFrame( animate );

addEventListeners();

var worldContainer = new PIXI.Container();
stage.addChild(worldContainer);

var wizardFtexture = PIXI.Texture.fromImage("../assets/characters/wizardF.png");
var wizardBtexture = PIXI.Texture.fromImage("../assets/characters/wizardB.png");
var wizardLtexture = PIXI.Texture.fromImage("../assets/characters/wizardL.png");
var wizardRtexture = PIXI.Texture.fromImage("../assets/characters/wizardR.png");

var spellTexture = PIXI.Texture.fromImage("../assets/events/spell1.png");

var wizard = new PIXI.Sprite(wizardFtexture);

wizard.anchor.x = 0.5;
wizard.anchor.y = 1;

wizard.position.x = renderer.width/2;
wizard.position.y = renderer.height/2;

wizard.z = 1;

stage.addChild(wizard);

var wizardPos, mousePos;

var mapContainer = new PIXI.DisplayObjectContainer();
worldContainer.addChild(mapContainer);

var texture = PIXI.Texture.fromImage(mapUrl);
var tile = new PIXI.Sprite(texture);
tile.anchor.x = 0.5;
tile.anchor.y = 0.5;
tile.position.x = renderer.width/2;
tile.position.y = renderer.height/2;
mapContainer.addChild(tile);

var goblinFtexture = PIXI.Texture.fromImage("../assets/characters/goblinF.png");
var goblinBtexture = PIXI.Texture.fromImage("../assets/characters/goblinB.png");
var goblinLtexture = PIXI.Texture.fromImage("../assets/characters/goblinL.png");
var goblinRtexture = PIXI.Texture.fromImage("../assets/characters/goblinR.png");

var goblin = new PIXI.Sprite(goblinFtexture);
goblin.anchor.x = 0.5;
goblin.anchor.y = 1;
goblin.position.x = renderer.width/2;
goblin.position.y = renderer.height/2 - 10;
goblin.scale.set(2, 2);
worldContainer.addChild(goblin);

var minimap = new PIXI.Sprite(texture);
minimap.width = 100;
minimap.height = 100;
minimap.alpha = 0.7;
stage.addChild(minimap);

var pm = new PIXI.Graphics();
pm.beginFill(0x0000ff);
pm.moveTo(100,100);
pm.lineTo(95,90);
pm.lineTo(105,90);
pm.endFill();
var playerMarkerTexture = pm.generateTexture();
var playerMarker = new PIXI.Sprite(playerMarkerTexture);
playerMarker.anchor.x = 0.5;
playerMarker.anchor.y = 0.5;
stage.addChild(playerMarker);

/*
  for (var i = 1; i < 6; i++) {
    for (var j = 1; j < 6; j++) {
      url = "../assets/terrain/tiles/" + j + "-" + i + ".png";
      var texture = PIXI.Texture.fromImage(url);
      var tile = new PIXI.Sprite(texture);
      tile.position.x = i*100;
      tile.position.y = j*100;
      mapContainer.addChild(tile);
    }
  }
*/

var prevTime = new Date().getTime();
var newTIme = new Date().getTime();

var scale = 2;

wizard.scale.set(scale, scale);

var attackContainer = new PIXI.Container();
worldContainer.addChild(attackContainer);
var attackList = [];

var isBox = true;
var collisionBox;
var collisionBoxList = [];

function setBoundries () {
  //Dynamically set outer map boundries according to map size
  var leftBoundry = "<box id=leftBoundry>" + ((-(tile.width/2)/tileSize)-1) + "," + (((tile.height/2)/tileSize)+1) + ",1," + ((tile.height/tileSize)+2) + "</box>";

  var rightBoundry = "<box id=rightBoundry>" + (((tile.width/2)/tileSize)) + "," + (((tile.height/2)/tileSize)+1) + ",1," + ((tile.height/tileSize)+2) + "</box>";

  var upBoundry = "<box id=upBoundry>" + (-((tile.width/2)/tileSize)-1) + "," + (((tile.height/2)/tileSize)+1) + "," + (((tile.width)/tileSize)+2) + ",1" + "</box>";

  var downBoundry = "<box id=downBoundry>" + (-((tile.width/2)/tileSize)-1) + "," + (-((tile.height/2)/tileSize)) + "," + (((tile.width)/tileSize)+2) + ",1" + "</box>";
    //Collision box data, in the format {top left x coord, top left y coord, width, height}
  var xml = "<collision>" + leftBoundry + rightBoundry + upBoundry + downBoundry + boundries + "</collision>";
    //Function for each set of four numbers defining a box
  $(xml).find("box").each(function() {
      //Reset isBox
    isBox = true;
    //'box' is the object representing the data between the tags
    var box = $(this);
    //Get the text element of the object, and split it at ',' into an array of four
    var collisionBox = box.text().split(',');
    //For each number in a box
    for (var i = 0; i < 4; i++) {
      //String -> int
      collisionBox[i] = parseFloat(collisionBox[i]);
      //If it can't be converted to an integer, write to the console, and don't add that box
      if (isNaN(collisionBox[i])) {
        console.log('Error: non-float collision box coordinate');
        isBox = false;
      }
    }
    //If the box is correctly formatted, add it's array to the collisionBoxList
    if (isBox) {
      collisionBoxList.push(collisionBox);
    }
  });
}

function loadBackdrop () {
  backText = PIXI.Texture.fromImage("../assets/terrain/water.png");
  //Tile left
  for (var i = 0; i < (worldSize.height/tileSize) + 8; i++) {
    for (var j = 0; j < 5; j++) {
      backSprite = new PIXI.Sprite(backText);
      backSprite.position.y = -worldSize.height/2+renderer.height/2-4*tileSize+i*tileSize;
      backSprite.position.x = -worldSize.width/2+renderer.width/2-5*tileSize+j*tileSize;
      worldContainer.addChild(backSprite);
    }
  }
  //Tile right
  for (var i = 0; i < (worldSize.height/tileSize) + 8; i++) {
    for (var j = 0; j < 5; j++) {
      backSprite = new PIXI.Sprite(backText);
      backSprite.position.y = worldSize.height/2+renderer.height/2+3*tileSize-i*tileSize;
      backSprite.position.x = worldSize.width/2+renderer.width/2+4*tileSize-j*tileSize;
      worldContainer.addChild(backSprite);
    }
  }
  //Tile top
  for (var i = 0; i < (worldSize.width/tileSize); i++) {
    for (var j = 0; j < 5; j++) {
      backSprite = new PIXI.Sprite(backText);
      backSprite.position.x = -worldSize.width/2+renderer.width/2+i*tileSize;
      backSprite.position.y = -worldSize.height/2+renderer.height/2-4*tileSize+j*tileSize;
      worldContainer.addChild(backSprite);
    }
  }
  //Tile bottom
  for (var i = 0; i < (worldSize.width/tileSize); i++) {
    for (var j = 0; j < 5; j++) {
      backSprite = new PIXI.Sprite(backText);
      backSprite.position.x = -worldSize.width/2+renderer.width/2+i*tileSize;
      backSprite.position.y = worldSize.height/2+renderer.height/2+4*tileSize-j*tileSize;
      worldContainer.addChild(backSprite);
    }
  }
}

var leftCollision, rightCollision, upCollision, downCollision;
leftCollision = rightCollision = upCollision = downCollision = false

var postActivationComplete = false

var worldSize;
var worldSizeSet = false;

loadAssets();

function animate() {
    requestAnimationFrame( animate );

    renderer.render(stage);

    if (!postActivationComplete) {
      worldSize = {width: worldContainer.width, height: worldContainer.height};
      setBoundries();
      loadBackdrop();
      postActivationComplete = true;
    }

    $('#status4').text(worldContainer.position.x + ", " + (worldSize.width/2) + ", " + worldContainer.position.y);

    wizardPos = {
      x: -roundTo(worldContainer.position.x/tileSize, 1),
      y: roundTo(worldContainer.position.y/tileSize, 1)
    }

    playerMarker.position.x = 50-(worldContainer.position.x/worldSize.width)*100;
    playerMarker.position.y = 50-(worldContainer.position.y/worldSize.height)*100;

    mousePos = {
      x: renderer.plugins.interaction.mouse.global.x,
      y: renderer.plugins.interaction.mouse.global.y
    }
    rightCollision = leftCollision = upCollision = downCollision = false;
    $('#status2').text("");
    checkCollisions();

    if (shift) {
      speed = 20;
      $('#status1').text("shift");
    } else {
      speed = 3;
      $('#status1').text("Wizard: " + wizardPos.x + ", " + wizardPos.y);
    }

    if (left && !leftCollision) {
      worldContainer.position.x += speed;
    }
    if (right && !rightCollision) {
      worldContainer.position.x -= speed;
    }
    if (up && !upCollision) {
      worldContainer.position.y += speed;
    }
    if (down && !downCollision) {
      worldContainer.position.y -= speed;
    }

    if (left || right) {
      if (left) {
        wizard.texture = wizardLtexture;
        playerMarker.rotation = Math.PI/2;
      } else {
        wizard.texture = wizardRtexture;
        playerMarker.rotation = 3*Math.PI/2;
      }
    } else {
      if (up) {
        wizard.texture = wizardBtexture;
        playerMarker.rotation = Math.PI;
      } else {
        wizard.texture = wizardFtexture;
        playerMarker.rotation = 0;
      }
    }

    var inBounds;
    if (mousePos.x > 0 && mousePos.x < renderer.width && mousePos.y > 0 && mousePos.y < renderer.height) {
      inBounds = true;
    } else {
      inBounds = false;
    }

    if (mouse1) {
      newTime = new Date().getTime();
      if (newTime > prevTime + 300 && inBounds)  {
        var newSpell = fireSpell();
        attackList.push(newSpell);

        prevTime = newTime;
      }
    }

        for (var i = 0; i < attackList.length; i++) {
          var temp = attackList.length;
          if (attackList[i].distance > 50*bulletSpeed) {
            attackContainer.removeChild(attackList[i].sprite);
            attackList.splice(i, 1);
          $('#status3').text(temp + ", " + attackList.length);
          } else {
            attackList[i].sprite.position.x += bulletSpeed*attackList[i].move.x;
            attackList[i].sprite.position.y -= bulletSpeed*attackList[i].move.y;
            attackContainer.addChild(attackList[i].sprite);
            attackList[i].distance += bulletSpeed;
            $('#status3').text(attackList.length);
          }
        }
}

function fireSpell() {
  var spellSprite = new PIXI.Sprite(spellTexture);
  spellSprite.anchor.x = 0.5;
  spellSprite.anchor.y = 0.5;
  spellSprite.position.x = -worldContainer.position.x + renderer.width/2;
  spellSprite.position.y = -worldContainer.position.y + renderer.height/2 - wizard.height/2;
  spellSprite.rotation = Math.PI + Math.atan2(mousePos.y - renderer.height/2, mousePos.x - renderer.width/2);
  var t = {x: (mousePos.x - renderer.width/2), y: (-mousePos.y + renderer.height/2)}
  var m = {x: t.x/Math.sqrt(Math.pow(t.x, 2) + Math.pow(t.y, 2)),
    y: t.y/Math.sqrt(Math.pow(t.x, 2) + Math.pow(t.y, 2)) }

  var spell = {sprite: spellSprite, move: m, distance: 0}
  return spell;
}

function distance (x1, y1, x2, y2) {
  return Math.sqrt(Math.pow((x2-x1), 2) + (Math.pow((y2-y1), 2)));
}

function addEventListeners () {
  window.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
  case 16: shift = true;
    break;
  case 32: space = true;
    break;
  case 65:
  case 37: left = true;
    break;
  case 87:
  case 38: up = true;
    break;
  case 68:
  case 39: right = true;
    break;
  case 83:
  case 40: down = true;
    break;
  default:
    break;
}
})

window.addEventListener('keyup', function(event) {
switch (event.keyCode) {
  case 16: shift = false;
    break;
  case 32: space = false;
    break;
  case 65:
  case 37: left = false;
    break;
  case 87:
  case 38: up = false;
    break;
  case 68:
  case 39: right = false;
    break;
  case 83:
  case 40: down = false;
    break;
  default:
    break;
}
})
}

window.addEventListener('mousedown', function(event) {
switch (event.button) {
  case 0: mouse1 = true;
    break;
  case 1: mouse2 = true;
    break;
  case 2: mouse3 = true;
    break;
}
})

window.addEventListener('mouseup', function(event) {
switch (event.button) {
  case 0: mouse1 = false;
    break;
  case 1: mouse2 = false;
    break;
  case 2: mouse3 = false;
    break;
}
})

function moveCharacter() {
  worldContainer.position.x = -$('#xCoord').val()*tileSize;
  worldContainer.position.y = $('#yCoord').val()*tileSize;
}

function roundTo (num, places) {
  return (Math.round(num*Math.pow(10, places))/Math.pow(10, places));
}

function checkCollisions () {
  for (var i = 0; i < collisionBoxList.length; i++) {
    var collisionBox = collisionBoxList[i];
    //Only check collision boxes you might actually hit
    if (Math.abs(wizardPos.x - collisionBox[0]) < 5 || Math.abs(wizardPos.y - collisionBox[1]) < 5) {
      if (wizardPos.x == collisionBox[0] + collisionBox[2] && wizardPos.y <= collisionBox[1] && wizardPos.y >= collisionBox[1] - collisionBox[3]) {
        $('#status2').text("leftCollision");
        leftCollision = true;
      }
      if (wizardPos.x == collisionBox[0] && wizardPos.y <= collisionBox[1] && wizardPos.y >= collisionBox[1] - collisionBox[3]) {
        $('#status2').append("rightCollision");
        rightCollision = true;
      }
      if (wizardPos.y == collisionBox[1]-collisionBox[3] && wizardPos.x >= collisionBox[0] && wizardPos.x <= collisionBox[0] + collisionBox[2]) {
        $('#status2').append("upCollision");
        upCollision = true;
      }
      if (wizardPos.y == collisionBox[1] && wizardPos.x >= collisionBox[0] && wizardPos.x <= collisionBox[0] + collisionBox[2]) {
        $('#status2').append("downCollision");
        downCollision = true;
      }
    }
  }
}

function characterToWorldCoords (num, axis) {
  if (axis == "x") {
    return (num*tileSize + renderer.width/2);
  } else if (axis == "y") {
    return (-num*tileSize + renderer.height/2);
  } else {
    return null;
  }
}

function loadAssets () {
  var treeTexture = PIXI.Texture.fromImage("../assets/terrain/tree.png");
  var treeSprite = new PIXI.Sprite(treeTexture);
  treeSprite.anchor.x = 0.5;
  treeSprite.anchor.y = 1;
  treeSprite.position.x = characterToWorldCoords(4.5, "x");
  treeSprite.position.y = characterToWorldCoords(-27.5, "y");
  worldContainer.addChild(treeSprite);
}
