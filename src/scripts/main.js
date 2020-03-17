const PIXI = require("pixi.js"),
    { Application, Loader, Sprite, utils } = PIXI;


let app = new Application({ 
    width: 256, 
    height: 256,                       
    antialias: true, 
    transparent: false, 
    resolution: 1
  }
);
let loader = new Loader();
let TextureCache = utils.TextureCache


document.body.appendChild(app.view);


loader.add("images/cat.png").load(setup);

function setup(){
    let cat = new Sprite(TextureCache["images/cat.png"]);

    app.stage.addChild(cat);
    
}