const PIXI = require("pixi.js"),
    { Application, Loader, Sprite, utils, Rectangle } = PIXI;



let app = new Application({
    width: 512,
    height: 512,
    antialias: true,
    transparent: false,
    resolution: 1
}
);
document.body.appendChild(app.view);


let loader = new Loader();
let TextureCache = utils.TextureCache


// const resources = [{
//     name: 'catImage',
//     url: 'images/cat.png'
//   }];
const resources = "images/treasureHunter.json";



loader.add(resources).load(setup).on("progress", function (loader, resource) {
    console.log("loading: " + resource.url);
    //Display the percentage of files currently loaded
    console.log("progress: " + loader.progress + "%");
});

let state,dungeon, explorer, treasure, door, id;




function setup() {
    //There are 3 ways to make sprites from textures atlas frames
    
    //Access the `TextureCache` directly
    let dungeonTexture = TextureCache["dungeon.png"];
    dungeon = new Sprite(dungeonTexture);
    app.stage.addChild(dungeon);

    let explorerTexture = TextureCache["explorer.png"];
    explorer = new Sprite(explorerTexture)
    explorer.x = 68;

    explorer.vx = 0;
    explorer.vy = 0;

    //Center the explorer vertically
    explorer.y = app.stage.height / 2 - explorer.height / 2;
    app.stage.addChild(explorer);


    //Make the treasure box using the alias
    treasure = new Sprite(TextureCache["treasure.png"]);
    app.stage.addChild(treasure);

    //Position the treasure next to the right edge of the canvas
    treasure.x = app.stage.width - treasure.width - 48;
    treasure.y = app.stage.height / 2 - treasure.height / 2;
    app.stage.addChild(treasure);

    //Make the exit door
    door = new Sprite(TextureCache["door.png"]);
    door.position.set(32, 0);
    app.stage.addChild(door);

    //Make the blobs
    let numberOfBlobs = 8,
        spacing = 32,
        xOffset = 150;

    //Make as many blobs as there are `numberOfBlobs`
    for (let i = 0; i < numberOfBlobs; i++) {

        //Make a blob
        let blob = new Sprite(TextureCache["blob.png"]);

        //Space each blob horizontally according to the `spacing` value.
        //`xOffset` determines the point from the left of the screen
        //at which the first blob should be added.
        let x = spacing * i + xOffset;

        //Give the blob a random y position
        //(`randomInt` is a custom function - see below)
        let y = randomInt(0, app.stage.height - blob.height);

        //Set the blob's position
        blob.x = x;
        blob.y = y;

        //Add the blob sprite to the stage
        app.stage.addChild(blob);
    }


    //Set the game state
    state = play;
    //Start the game loop 
    app.ticker.add(delta => gameLoop(delta));

}

function gameLoop(delta){
    //Update the current game state:
    state(delta);
}


// All here is 60fps
function play(delta) {
    explorer.vx = 1;
    explorer.x += explorer.vx;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  