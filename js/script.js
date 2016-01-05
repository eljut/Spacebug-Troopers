var game = new Phaser.Game(700, 700, Phaser.AUTO, '', { preload: preload, create: create, update: update });
game.ScaleManager

function preload() {
    //Cessmap background. Each square is 100px.
    game.load.image('chessmap', 'assets/chessmap.png');
    game.load.image('star', 'assets/star.png');
    //game.load.spritesheet('voxobot', 'assets/voxobot.png', 64, 96);
    game.load.spritesheet('redsoldier', 'assets/redsoldier_spritesheet.png', 100, 100);
    game.load.spritesheet('greensoldier', 'assets/redsoldier_spritesheet.png', 100, 100);
    game.load.spritesheet('bluesoldier', 'assets/redsoldier_spritesheet.png', 100, 100);
    game.load.spritesheet('monster', 'assets/monster_spritesheet.png', 100, 100);
    
    // New preloads
    game.load.image('healthBar', 'assets/health.png');
    game.load.spritesheet('explosion', 'assets/explosion.png', 32,32);
    game.load.audio('sfx', 'assets/SFX/Explosion.wav');
    // New preloads
}

var language = 'en_US';

var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.lang = language;
recognition.interimResults = true;
recognition.onend = function() {recognition.start();}
var speechInput = '';
var final_transcript = '';

var su = new SpeechSynthesisUtterance();
su.lang = language;
su.rate = 2;
su.pitch = 1.5;
su.text = 'Hello voxobot';
speechSynthesis.speak(su);

var player;
var monsters = [];
var monster1;
var monster2;
var monster3;
var platforms;
var cursors;
var animationRunning = false;

var stars;
var score = 0;
var scoreText;


// New variables
var playerHealth;
var enemyHealth;
var healthBarWidth = 300;
var healthBarHeight = 30;
var AP = 10;
var APText;
var aKey;
var explosion;
var playerXPos;
var playerYPos;
var SFX;
// New variables




// Get frames for a row from a spritesheet.
function row(number, col){
    if (col == 4) {
        var pos = number*4;
        return [pos, 1+pos, 2+pos, 3+pos];
    } else if (col == 3) {
        var pos = number*3;
        return [pos, 1+pos, 2+pos];
    }
}

recognition.onresult = function(event) {
  // if (event.results.length > 0) {
    speechInput = '';
    // console.log(event);
    // for (var i = event.resultIndex; i < event.results.length; ++i) {
    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
        } else {
            speechInput += event.results[i][0].transcript.toLowerCase();
        }

    }
    // console.log("Input: ", speechInput);


    // if (event.results.length > 0) {
    //     speechInput = event.results[0][0].transcript;
    //     console.log(speechInput);
    //     su.text = speechInput;
    //     speechSynthesis.speak(su);
    // }

}

function create() {

    // New create stuff
    SFX = game.add.audio('sfx');
    SFX.allowMultiple = true;
    
    // Definera knapptryck
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    eKey = game.input.keyboard.addKey(Phaser.Keyboard.E);
    // New create stuff

    //  A simple background for our game
    game.add.sprite(0, 0, 'chessmap');

    createPlayer();
    createMonster();
    // New create stuff
    createHealthBars();
    // New create stuff
    
    //  Finally some stars to collect
    stars = game.add.group();
    stars.enableBody = true;

    //  Here we'll create some stars and place them at random squares across the board
    // oddNumbers = [1,3,5,7,9,11,13];
    // for (var i = 0; i < 5; i++)
    // {
    //     randOddX = oddNumbers[Math.floor(Math.random()*6)];
    //     randOddY = oddNumbers[Math.floor(Math.random()*6)];
    //     randPlaceX = Math.floor((Math.random() * randOddX) + 1) * 50;
    //     randPlaceY = Math.floor((Math.random() * randOddY) + 1) * 50;
    //     console.log(randPlaceX);
    //     console.log(randPlaceY);
    //     //  Create a star inside of the 'stars' group
    //     var star = stars.create(randPlaceX, randPlaceY, 'star');
    //     i = i+1;
    // }

    //  The score
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    // // Button
    // var graphics = game.add.graphics(698, -250);
    // // set a fill and line style
    // graphics.beginFill(0xff6cff);
    // graphics.lineStyle(2, 0x77ffcc, 1);
    // // draw a rectangle
    // graphics.drawRect(0, 250, 100, 25);
    // graphics.endFill();
    // buttonText = game.add.text(704, 2, 'step. walk', { fontSize: '16px', fill: '#000' });
    // // input
    // graphics.inputEnabled = true;
    // graphics.input.useHandCursor = true;
    // graphics.events.onInputDown.add(function () {
    //     if(SOMETHING) {
    //         buttonText.setText('SOMETHING');
    //     } else {
    //         buttonText.setText('SOMETHING ELSE');
    //     }
    // }, this);

    // Start speech recognition
    recognition.start();
}

function update() {
    if(speechInput != '') {
        game.debug.text(speechInput, game.world.height/2-20, game.world.width/2, "#00c000");
    }

    if(animationRunning === false) {
        if (speechInput.indexOf('left') > -1
            || cursors.left.isDown
            && !cursors.right.isDown) {
            //tween left
            walk(player, -100, 0, 'walk_left', 10);
            player.scale.setTo(1,1); //Mirror character

            su.text = 'Okay, going left.';
            speechSynthesis.speak(su);

            speechInput = '';

            monsterAction();

        } else if (speechInput.indexOf('right') > -1
            || cursors.right.isDown
            && !cursors.left.isDown) {
            //tween right
            walk(player, 100, 0, 'walk_left', 10);
            player.scale.setTo(-1,1); //Unmirror character

            su.text = 'Okay, going right.';
            speechSynthesis.speak(su);

            speechInput = '';

            monsterAction();

        } else if (speechInput.indexOf('down') > -1
            || cursors.down.isDown
            && !cursors.left.isDown) {
            //tween down
            walk(player, 0, 100, 'walk_down', 10);
            player.scale.setTo(1,1); //Unmirror character

            su.text = 'Okay, going down now if you don\'t mind.';
            speechSynthesis.speak(su);

            speechInput = '';

            monsterAction();

        } else if (speechInput.indexOf('up') > -1
            || cursors.up.isDown
            && !cursors.left.isDown) {
            //tween up
            walk(player, 0, -100, 'walk_up', 10);
            player.scale.setTo(1,1); //Unmirror character

            su.text = 'Now I\'m going up, tra la la la';
            speechSynthesis.speak(su);

            speechInput = '';

            monsterAction();
        }
    } 
    
    // New update functions
    aKey.onDown.add(attackEnemy, this);
    if (speechInput.indexOf('attack') > -1){
         attackEnemy();
    }
    eKey.onDown.add(createExplosion, this);
    // New update functions
    
    
}






function createPlayer() {
    // The player and its settings
    player = game.add.sprite(350, 650, 'redsoldier');
    // Set anchor to middle so that character can be flipped without movement.
    player.anchor.setTo(.5, .5);

    // Define animation
    // FORMAT: {what}.animations.add({action}, {frames}, {framerate}, {loop?})

    // Walking animation
    player.animations.add('walk_left', row(2, 4), 10, true);
    player.animations.add('walk_down', row(0, 4), 10, true);
    player.animations.add('walk_up', row(1, 4), 10, true);
    animationRunning = false;
}

function createMonster() {
    // The player and its settings
    monsters = game.add.group();
    monsters.enableBody = true;

    var p = 0;
    for (var i = 0; i < 3; i++) {

        var monster = monsters.create(250 + p, 50, 'monster');
        monster.anchor.setTo(.5, .5);

        //createMonster(250 + p, 50);
        p = p + 100;
        console.log(i);
        
    }
    console.log("Player; ", player);
    console.log("Monsters; ", monsters);

    monsters.callAll('animations.add', 'animations', 'walk_down', row(0, 3), 10, true);
    monsters.callAll('play', null, 'walk_down');

    // Set anchor to middle so that character can be flipped without movement.

    // monster.animations.add('walk_left', row(2), 10, true);
    // monster.animations.add('walk_down', row(0), 10, true);
    // monster.animations.add('walk_up', row(1), 10, true);
}

function walk (character, destinationX, destinationY, animation, animationVal) {
    //Calculate new position
    var newX = character.x + destinationX;
    var newY = character.y + destinationY;

    //Create a transition to the new location
    if(newX < game.world.width && newX > 0 && newY < game.world.height && newY > 0) {
        character.animations.play(animation, animationVal, true);
        animationRunning = true;
        console.log(character.key+' is moving')
        tween = this.game.add.tween(character).to({x:newX, y:newY}, 800, null, true);
        tween.onComplete.addOnce(stopWalking, this);
    } else {
        stopWalking(character);
    }

}

function stopWalking (character) {
    player.animations.stop('walk_left',true);
    player.animations.stop('walk_up',true);
    player.animations.stop('walk_down',true);
    animationRunning = false;
    character.frame = 0;
    console.log(character.key+' is idle');
}

function monsterAction () {
    console.log("Chosen monster; ", monsters[Math.random()*3 + 1]);
    var randomMon = monsters.getRandom();//Math.floor(Math.random()*3);
    console.log(randomMon);
    walk(randomMon, 0, 100, 'walk_down', 10);
    //monsters[randomMon]
}

function collectStar (player, star) {
    // Removes the star from the screen
    console.log("Gotcha!");
    star.kill();
    if (star.group) {
       star.group.remove(star);
    } else if (star.parent) {
       star.parent.removeChild(star);
    }
    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;
    
    }
    
    // New Functions
    
    
    function decreaseEnemyHealth(){
    enemyHealthBar.cropRect.width -= healthBarWidth*0.1;
    enemyHealthBar.updateCrop();
    }
    
    function decreaseAP(){
    AP -= 1;
    APText.text = 'AP: ' + AP;
    }
    
    
    function attackEnemy(){

        
        playerXPos = player.position.x;
        playerYPos = player.position.y;

        console.log(monster.position);
        walk(
        player, 
        monster.position.x-player.position.x,
        monster.position.y-player.position.y+monster.height,
        'walk_up',
        2);
        
        //(character, destinationX, destinationY, animation, animationVal)
        
        //player.scale.setTo(-1,1); //Mirror character
        animationRunning = true;
        tween.onComplete.addOnce(createExplosion, this);
        tween.onComplete.addOnce(decreaseAP, this);     

        tween.onComplete.addOnce(decreaseEnemyHealth, this);
        tween.onComplete.addOnce(stopWalking, this);
        tween.onComplete.addOnce(moveBack, this);
        player.animations.play('walk_up',20,true);
      
    }

    function moveBack(){
        walk(
        player,
        playerXPos- player.position.x, 
        playerYPos- player.position.y,
        'walk_back',
        2);
         
        animationRunning = true;
        tween.onComplete.addOnce(stopWalking, this);
        player.animations.play('walk_down',20,true);

    }
    
    
    function createExplosion(){
        var explosion = this.add.sprite(monster.x, monster.y, 'explosion');
        explosion.anchor.setTo(0.5, 0.5);
        explosion.animations.add('boom');
        explosion.play('boom', 15, false, true);
        SFX.play();
    }

    function createHealthBars(){
        playerHealthBar = game.add.sprite(0, game.world.height-healthBarHeight, 'healthBar');   /////////
        playerHealthBar.crop(new Phaser.Rectangle(0,0,healthBarWidth,healthBarHeight)); 
        enemyHealthBar = game.add.sprite(0, 0, 'healthBar');    /////////
        enemyHealthBar.crop(new Phaser.Rectangle(0,0,healthBarWidth,healthBarHeight));
        APText = game.add.text(0, game.world.height-(healthBarHeight*2), 'AP: ' + AP, { fontSize: '32px',           fill: '#000' });
    }
    
    



    // New functions
    
    
    
    
