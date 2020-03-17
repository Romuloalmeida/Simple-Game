const PIXI = require("pixi.js"),
    { Text,Application, TextStyle, Container, Loader, Sprite, utils, Rectangle } = PIXI;

const hitTestRectangle = require('./utils/hitTestRectangle').default;
const contain = require("./utils/contain").default;


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
//     name: 'explorerImage',
//     url: 'images/explorer.png'
//   }];
const resources = "images/treasureHunter.json";



loader.add(resources).load(setup).on("progress", function (loader, resource) {
    console.log("loading: " + resource.url);
    //Display the percentage of files currently loaded
    console.log("progress: " + loader.progress + "%");
});

let blobs,message,healthBar,gameOverScene,gameScene,state,dungeon, explorer, treasure, door, id;




function setup() {
    gameScene = new Container();
    gameScene.visible = true;
    app.stage.addChild(gameScene);

    gameOverScene = new Container();
    gameOverScene.visible = false;
    app.stage.addChild(gameOverScene);
    
    

    //Access the `TextureCache` directly
    let dungeonTexture = TextureCache["dungeon.png"];
    dungeon = new Sprite(dungeonTexture);
    gameScene.addChild(dungeon);

    //Make the exit door
    door = new Sprite(TextureCache["door.png"]);
    door.position.set(32, 0);
    gameScene.addChild(door);

    let explorerTexture = TextureCache["explorer.png"];
    explorer = new Sprite(explorerTexture);
    explorer.x = 68;

    explorer.vx = 0;
    explorer.vy = 0;

    //Center the explorer vertically
    explorer.y = app.stage.height / 2 - explorer.height / 2;
    gameScene.addChild(explorer);


    //Make the treasure box using the alias
    treasure = new Sprite(TextureCache["treasure.png"]);
    gameScene.addChild(treasure);

    //Position the treasure next to the right edge of the canvas
    treasure.x = app.stage.width - treasure.width - 48;
    treasure.y = app.stage.height / 2 - treasure.height / 2;
    gameScene.addChild(treasure);

    

    //Make the blobs
    let numberOfBlobs = 8,
        spacing = 32,
        xOffset = 150;

    //Make as many blobs as there are `numberOfBlobs`
    blobs = new PIXI.ParticleContainer();
    for (let i = 0; i < numberOfBlobs; i++) {

        //Make a blob
        let blob = new Sprite(TextureCache["blob.png"]);

        //Space each blob horizontally according to the `spacing` value.
        //`xOffset` determines the point from the left of the screen
        //at which the first blob should be added.
        let x = spacing * i + xOffset;

        //Give the blob a random y position
        //(`randomInt` is a custom function - see below)
        var randomInt = require("./utils/random").default;
        let y = randomInt(0, app.stage.height - blob.height);

        //Set the blob's position
        blob.x = x;
        blob.y = y;

        blob.vy = 10;

        //Add the blob sprite to the stage
        blobs.addChild(blob);
    }
    gameScene.addChild(blobs);


    //Create the health bar
    healthBar = new PIXI.Container();
    healthBar.position.set(app.stage.width - 170, 4)
    gameScene.addChild(healthBar);

    //Create the black background rectangle
    let innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    //Create the front red rectangle
    let outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(0, 0, 128, 8);
    outerBar.endFill();
    healthBar.addChild(outerBar);

    healthBar.outer = outerBar;
    healthBar.outer.width = 128;

    //Set the game state
    state = play;
    //Start the game loop 
    app.ticker.add(delta => gameLoop(delta));



    let style = new TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "white"
      });
    message = new Text("The End!", style);
    message.x = 120;
    message.y = app.stage.height / 2 - 32;
    gameOverScene.addChild(message);


    let keyboard = require("./utils/keyboard").default;

    let left = keyboard("ArrowLeft"),
        up = keyboard("ArrowUp"),
        right = keyboard("ArrowRight"),
        down = keyboard("ArrowDown");

    //Left arrow key `press` method
    left.press = () => {
        //Change the explorer's velocity when the key is pressed
        explorer.vx = -5;
    };
    
    //Left arrow key `release` method
    left.release = () => {
        //If the left arrow has been released, and the right arrow isn't down,
        //and the explorer isn't moving vertically:
        //Stop the explorer
        explorer.vx = 0;
    };

    //Up
    up.press = () => {
        explorer.vy = -5;
    };
    up.release = () => {
        explorer.vy = 0;
    };

    //Right
    right.press = () => {
        explorer.vx = 5;
    };
    right.release = () => {
        explorer.vx = 0;
    };

    //Down
    down.press = () => {
        explorer.vy = 5;
    };
    down.release = () => {
        explorer.vy = 0;
    };

}

function gameLoop(delta){
    //Update the current game state:
    state(delta);
}

// All here is 60fps
function play(delta) {

    if(!contain(explorer, {x: 32, y: 0, width: 488, height: 480})){
        explorer.x += explorer.vx;
        explorer.y += explorer.vy;
    }
    


    var explorerHit = false;

    blobs.children.forEach(function(blob) {

        //Move the blob
        blob.y += blob.vy;
      
        //Check the blob's screen boundaries
        let blobHitsWall = contain(blob, {x: 28, y: 10, width: 488, height: 480});
      
        //If the blob hits the top or bottom of the stage, reverse
        //its direction
        if (blobHitsWall === "top" || blobHitsWall === "bottom") {
          blob.vy *= -1;
        }
      
        //Test for a collision. If any of the enemies are touching
        //the explorer, set `explorerHit` to `true`
        if(hitTestRectangle(explorer, blob)) {
          explorerHit = true;
        }
        
      });

      if(explorerHit) {

        //Make the explorer semi-transparent
        explorer.alpha = 0.5;
        //Reduce the width of the health bar's inner rectangle by 1 pixel
        healthBar.outer.width -= 5;
      
      } else {
        //Make the explorer fully opaque (non-transparent) if it hasn't been hit
        explorer.alpha = 1;
      }

      if (hitTestRectangle(explorer, treasure)) {
        treasure.x = explorer.x + 8;
        treasure.y = explorer.y + 8;
      }

      if (hitTestRectangle(treasure, door)) {
        state = end;
        message.text = "You won!";
      }

      if (healthBar.outer.width < 0) {
        state = end;
        message.text = "You lost!";
      }

}

function end(){
    gameScene.visible = false;
    gameOverScene.visible = true;
}

  