var player;

var collectables;
var archiveCount = 0;

var collectableSpawner;

var headerHeight = 30;

var currentPeriod = 0;

var periodTarget = [10,10,12,12,15,15,18,18,20,20];
var periodDistractionRates = [0.3,0.25,0.3,0.4,0.35,0.45,0.4,0.5,0.55,0.55];
var pdRate = [0,0,0.03,0.02,0.01,0.03,0.02,0.03,0.03,0.03];

var archiveText;
var scoreText;
var periodText;

var PdGame = {
    Game: {
        preload: function() {
            game.load.image('back', 'assets/back.png');
            game.load.image('header', 'assets/header.png');
            game.load.image('archive', 'assets/archive.png'); //32x32
            game.load.image('beer', 'assets/beer.png'); //32x32
            game.load.image('pd', 'assets/pd.png'); //32x32
            game.load.image('playerAvatar', 'assets/player.png'); //64x64
        },

        create: function() {
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.add.sprite(0, 0, 'back');

            var topHeader = game.add.sprite(0, 0, 'header');
            topHeader.bringToTop();

            var bottomHeader = game.add.sprite(0, game.world.height - 30, 'header');
            bottomHeader.bringToTop();

            var font = { font: '14px Helvetica', fill: '#FFF' , fontWeight:'500' };
            var textY = game.world.height - 24;

            scoreText  = game.add.text(game.world.width - 85, textY, 'Pontos: 0', font);
            archiveText  = game.add.text(8, textY, '0/' + periodTarget[0] + ' arquivos',  font);
            periodText = game.add.text(260, textY, 'Calouro', font);

            collectables = game.add.group();
            collectables.enableBody = true;

            var playerSprite = game.add.sprite(game.world.width/2 - 32, game.world.height - 64 - headerHeight, 'playerAvatar');
            player = new Player(playerSprite, 200, 0);

            collectableSpawner = new CollectableSpawner(collectables, 400, 150, 100, periodDistractionRates);
        },

        update: function() {

            function collect(player, collectable){
                if (collectable.key == 'pd'){
                    console.log('FOI')

                    collectable.kill();

                    collectables.forEach(function(item){
                        if (item.alive && item.key == 'beer'){

                            if (item.inWorld){
                                console.log(item.x)
                                collectableSpawner.spawnObject('archive', item.x, item.y);
                            }

                            item.kill();    
                        }
                    }, true);
                }else if (collectable.key == 'archive'){
                    collectable.kill();

                    archiveCount++;

                    if (archiveCount >= periodTarget[currentPeriod]){
                        currentPeriod++;

                        if (currentPeriod < periodTarget.length - 1){
                            periodText.text = currentPeriod + 1 +'º periodo';          
                        }
                        else if (currentPeriod == periodTarget.length - 1){
                            periodText.text = 'Formando';             
                        }    
                        else{
                            gameEnd(true); 
                            return;
                        }

                        archiveCount = 0;   
                    }

                    scoreText.text = 'Pontos: ' + ((archiveCount * 100) + (currentPeriod * 1000));
                    archiveText.text = archiveCount + '/' + periodTarget[currentPeriod] + ' arquivos';
                }else{
                    player.kill();
                    gameEnd(false);      
                }
            }

            function gameEnd(win){
                console.log('YOU LOSE ' + win);
            }

            game.physics.arcade.overlap(player.entinty, collectables, collect, null, this);

            player.move(game.input.keyboard.createCursorKeys());

            collectableSpawner.spawn(currentPeriod);
        }

    }
}

var game = new Phaser.Game(600, 600, Phaser.AUTO, '', PdGame.Game);
