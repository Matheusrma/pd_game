var player;

var collectables;
var collectableSpawner;

var headerHeight = 30;

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
    var self = this;

    this.gameEnded = false;

    this.periodTarget = [5,8,10,10,12,12,15,15,18,20];
    this.periodDistractionRates = [0.3,0.4,0.5,0.5,0.6,0.65,0.6,0.7,0.75,0.8];
    this.pdRate = [0,0,0.03,0.02,0.01,0.03,0.02,0.03,0.03,0.03];
    this.periodSpawnDelay = [700,600,600,450,500,350,350,350,300,250];

    this.archiveCount = 0;
    this.currentPeriod = 0;

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

            for (var i = 0; i < 4; ++i){
                collectableSpawner.spawnObject('archive');
            }

        }else if (collectable.key == 'archive'){
            collectable.kill();

            this.archiveCount++;

            if (this.archiveCount >= this.periodTarget[this.currentPeriod]){
                this.updatePeriod();
            }

            this.updateScore();
            this.archiveText.text = this.archiveCount + '/' + this.periodTarget[this.currentPeriod] + ' arquivos';
        }else{
            player.kill();
            this.finishGame(false);      
        }                   
    }

    this.updateScore = function(){
        var points = ((this.archiveCount * 100) + (this.currentPeriod * 1000));
        var prefix = 'Pontos: ';

        for (var i = 0; i < 5 - (points + '').length; ++i){
            prefix += '0';            
        }

        this.scoreText.text = prefix + points;
    }

    this.updatePeriod = function(){
        this.currentPeriod++;

        var bounce = game.add.tween(this.periodText.scale);
        bounce.to({ x: 1.05, y:1.05 }, 400, Phaser.Easing.Linear.None);

        bounce.onComplete.add(function(){
            self.periodText.scale.x = 1;
            self.periodText.scale.y = 1;
        });

        if (this.currentPeriod < this.periodTarget.length - 1){
            this.periodText.text = this.currentPeriod + 1 +'º periodo';  
            bounce.start();        
        }
        else if (this.currentPeriod == this.periodTarget.length - 1){
            this.periodText.text = 'Formando';             
            bounce.start();
        }    
        else{
            this.finishGame(true); 
            return;
        }

        this.archiveCount = 0;   
    }

    this.finishGame = function(win){
        this.gameEnded = true;
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
        this.archiveCount = 0;
        this.currentPeriod = 0;
    },

    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.add.sprite(0, 0, 'back');

        var topHeader = game.add.sprite(0, 0, 'header');
        topHeader.bringToTop();

        var bottomHeader = game.add.sprite(0, game.world.height - 30, 'header');
        bottomHeader.bringToTop();

        var font = { font: '14px Helvetica', fill: '#FFF' , fontWeight:'500' };
        var fontBig = { font: '18px Helvetica', fill: '#FFF' , fontWeight:'500'};
        var textY = game.world.height - 24;

        this.scoreText  = game.add.text(game.world.width - 100, textY, 'Pontos: 00000', font);
        this.archiveText  = game.add.text(8, textY, '0/' + this.periodTarget[0] + ' arquivos',  font);
        this.periodText = game.add.text(300, textY + 10, 'Calouro', fontBig);

        this.periodText.anchor.set(0.5);

        collectables = game.add.group();
        collectables.enableBody = true;

        var playerSprite = game.add.sprite(game.world.width/2 - 32, game.world.height - 64 - headerHeight, 'playerAvatar');
        player = new Player(playerSprite, 200, 0);

        collectableSpawner = new CollectableSpawner(collectables, this.periodSpawnDelay, 150, 100, this.periodDistractionRates, this.pdRate);
    },

    update: function() {
        if (this.gameEnded) return;

        game.physics.arcade.overlap(player.entinty, collectables, this.collect, null, this);
        player.move(game.input.keyboard.createCursorKeys());
        collectableSpawner.spawn(this.currentPeriod);
    }
};

var game = new Phaser.Game(600, 600, Phaser.AUTO, 'game');
game.state.add('MainMenu', PdGame.MainMenu);
game.state.add('Game', PdGame.Game);
game.state.start('MainMenu');
