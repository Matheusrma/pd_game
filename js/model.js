function Player(entinty, speed, accel){
    this.entinty = entinty;
    this.speed = speed;
    this.accel = accel;

    game.physics.arcade.enable(this.entinty);

    this.entinty.body.gravity.y = 0;
    this.entinty.body.collideWorldBounds = true;

    this.move = function(cursors){
        this.entinty.body.velocity.x = 0;
     
        if (cursors.left.isDown) {
            this.entinty.body.velocity.x = -this.speed;
        }
        else if (cursors.right.isDown) {
            this.entinty.body.velocity.x = this.speed;
        }
    }
}

function CollectableSpawner(group, spawnDelay, collectableSpeed, minSpeed, distractionRate, pdRate){
    var _lastArchiveSpawn = 0;
    var _spawnDelay = spawnDelay;
    var _collectableSpeed = collectableSpeed;
    var _minSpeed = minSpeed;

    var _group = group;

    var _distractionRate = distractionRate;
    var _pdRate = pdRate;

    this.spawn = function(period){
        if (game.time.time - _lastArchiveSpawn < _spawnDelay[period] ) return;

        _lastArchiveSpawn = game.time.time;    

        var dice = Math.random();
        if (dice < _pdRate[period]){
            this.spawnObject('pd'); 
        }
        else if (dice < _distractionRate[period]){
            this.spawnObject('beer'); 
        }
        else{
            this.spawnObject('archive'); 
        }
    }

    this.spawnObject = function(key,posx,posY){
        posx = posx || Math.max(0, Math.min(Math.random() * game.world.width , game.world.width - 40));
        posY = posY || headerHeight;

        var item = _group.create(posx, posY, key);
        item.body.velocity.y += Math.max(_minSpeed, Math.random() * _collectableSpeed);  
    }
}
