var player;

var collectables;
var archiveCount = 0;

var collectableSpawner;

var headerHeight = 30;

var currentPeriod = 0;

var PdGame = {};

PdGame.MainMenu = function() {

}

PdGame.MainMenu.prototype = {
    preload: function() {
        game.load.image('menu', 'assets/menu.png');
    },
    create: function() {
        game.add.sprite(0, 0, 'menu');
    },
    update: function() {
        var startKey = game.input.keyboard.addKey(13);
        
        startKey.onDown.add(function(){
            game.state.start('Game');
        }, this);
    }
}

PdGame.Scoreboard = function() {

}

PdGame.Scoreboard.prototype = {
    preload: function() {
        game.load.image('back', 'assets/back.png');
    },
    create: function() {
        game.add.sprite(0, 0, 'back');
    },
    update: function() {
        
    }
}

PdGame.Game = function() {
    this.gameEnded = false;

    this.periodTarget = [10,10,12,12,15,15,18,18,20,20];
    this.periodDistractionRates = [0.3,0.25,0.3,0.4,0.35,0.45,0.4,0.5,0.55,0.55];
    this.pdRate = [0,0,0.03,0.02,0.01,0.03,0.02,0.03,0.03,0.03];

    this.archiveText;
    this.scoreText;
    this.periodText;

    this.collect = function(player, collectable){
        if (collectable.key == 'pd'){
            collectable.kill();

            collectables.forEach(function(item){
                if (item.alive && item.key == 'beer'){
                    if (item.inWorld){
                        collectableSpawner.spawnObject('archive', item.x, item.y);
                    }

                    item.kill();    
                }
            }, true);
        }else if (collectable.key == 'archive'){
            collectable.kill();

            archiveCount++;

            if (archiveCount >= this.periodTarget[currentPeriod]){
                currentPeriod++;

                if (currentPeriod < this.periodTarget.length - 1){
                    this.periodText.text = currentPeriod + 1 +'º periodo';          
                }
                else if (currentPeriod == this.periodTarget.length - 1){
                    this.periodText.text = 'Formando';             
                }    
                else{
                    this.finishGame(true); 
                    return;
                }

                archiveCount = 0;   
            }

            this.scoreText.text = 'Pontos: ' + ((archiveCount * 100) + (currentPeriod * 1000));
            this.archiveText.text = archiveCount + '/' + this.periodTarget[currentPeriod] + ' arquivos';
        }else{
            player.kill();
            this.finishGame(false);      
        }                   
    }

    this.finishGame = function(win){
        this.gameEnded = true;

        /*
        collectables.forEach(function(item){
            if (item.alive){
                item.body.velocity.y = 0;
            }
        }, true);
        */
    }
};

PdGame.Game.prototype = {
    preload: function() {
        game.load.image('back', 'assets/back.png');
        game.load.image('header', 'assets/header.png');
        game.load.image('archive', 'assets/archive.png'); //32x32
        game.load.image('beer', 'assets/beer.png'); //32x32
        game.load.image('pd', 'assets/pd.png'); //32x32
        game.load.image('playerAvatar', 'assets/player.png'); //64x64

        this.gameEnded = false;
    },

    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.add.sprite(0, 0, 'back');

        var topHeader = game.add.sprite(0, 0, 'header');
        topHeader.bringToTop();

        var bottomHeader = game.add.sprite(0, game.world.height - 30, 'header');
        bottomHeader.bringToTop();

        var font = { font: '14px Helvetica', fill: '#FFF' , fontWeight:'500' };
        var fontBig = { font: '18px Helvetica', fill: '#FFF' , fontWeight:'500' };
        var textY = game.world.height - 24;

        this.scoreText  = game.add.text(game.world.width - 90, textY, 'Pontos: 0', font);
        this.archiveText  = game.add.text(8, textY, '0/' + this.periodTarget[0] + ' arquivos',  font);
        this.periodText = game.add.text(260, textY - 2, 'Calouro', fontBig);

        collectables = game.add.group();
        collectables.enableBody = true;

        var playerSprite = game.add.sprite(game.world.width/2 - 32, game.world.height - 64 - headerHeight, 'playerAvatar');
        player = new Player(playerSprite, 200, 0);

        collectableSpawner = new CollectableSpawner(collectables, 400, 150, 100, this.periodDistractionRates, this.pdRate);
    },

    update: function() {
        if (this.gameEnded) return;

        game.physics.arcade.overlap(player.entinty, collectables, this.collect, null, this);

        player.move(game.input.keyboard.createCursorKeys());

        collectableSpawner.spawn(currentPeriod);
    }
};

var game = new Phaser.Game(600, 600, Phaser.AUTO, 'game');
game.state.add('MainMenu', PdGame.MainMenu);
game.state.add('Game', PdGame.Game);
game.state.start('MainMenu');
