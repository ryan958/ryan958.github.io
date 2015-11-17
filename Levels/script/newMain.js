try {

  var characters = ["wizard", "goblin"];

  var stage = new PIXI.Stage(0x000000, true);
  var renderer = PIXI.autoDetectRenderer(
      document.getElementById("game-canvas").width,
      document.getElementById("game-canvas").height,
      {view:document.getElementById("game-canvas")}
    );
  document.body.appendChild(renderer.view);

function addAssets() {
  for (var i = 0; i < characters.length; i++) {
    loader.add(characters[i] + "F", '../assets/characters/' + characters[i] + "F.png")
    .add(characters[i] + "B", '../assets/characters/' + characters[i] + "B.png")
    .add(characters[i] + "L", '../assets/characters/' + characters[i] + "L.png")
    .add(characters[i] + "R", '../assets/characters/' + characters[i] + "R.png");
  }
  loader.add('map', '../assets/terrain/map.png');
}

var loader = new PIXI.loaders.Loader();
addAssets();
loader.on('progress', function (loader, loadedResource){
  $('#status1').text("Progress: " + Math.round(loader.progress) + "%");
})
.load(function (loader, resources) {
  var goblin = new PIXI.Sprite(resources.goblinF.texture);
  stage.addChild(goblin);
  var map = new PIXI.Sprite(resources.map.texture);
  stage.addChild(map);
});

requestAnimationFrame(animate);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(stage);
  }

} catch(err) {
  if (err = "ReferenceError: 'PIXI' is undefined")
  alert("Cannot connect to rawgit server\n" + err);
}
