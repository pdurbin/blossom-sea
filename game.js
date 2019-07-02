var game = new Phaser.Game(800, 600, Phaser.AUTO, "gameDiv");

var mainState = {

    preload: function() {
        if (!game.device.desktop) {
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            // to fit landscape on mobile
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
        }

        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        game.stage.backgroundColor = '#185edc';

        game.load.image('bird', 'assets/blossom.png');
        game.load.image('pipe', 'assets/fishy.png');
        game.load.image('floor', 'assets/floor.gif');
        game.load.image('flipy', 'assets/flipy.png');

    },

    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.pipes = game.add.group();
        this.floors = game.add.group();
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);
        this.timer = game.time.events.loop(1000, this.addRowOfSeaweed, this);

        this.bird = game.add.sprite(10, 245, 'bird');
        this.bird.scale.setTo(3.0, 3.0);
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 250;

        for (var i = 0; i < 6; i++) {
            this.addOneSeaweed(i * 190, 400);
        }

        // New anchor position
        this.bird.anchor.setTo(-0.2, 0.5);

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        spaceKey.onDown.add(this.jump, this);
        game.input.onDown.add(this.jump, this);
        var downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        downKey.onDown.add(this.dive, this);
        game.input.onDown.add(this.dive, this);

        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", {
            font: "30px Arial",
            fill: "#ffffff"
        });

        game.input.onUp.add(this.mouseUp, this);
        game.input.onDown.add(this.mouseDown, this);
        //this.text1 = game.add.text(game.world.centerX, game.world.centerY, "swipe up or down!");
        //this.text1.fill = "#ffffff";
        //this.text1.anchor.set(0.5, 0.5);
    },

    update: function() {
        if (this.bird.y < 0 || this.bird.y > game.world.height)
            this.restartGame();

        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);

        // Slowly rotate the bird downward, up to a certain point.
        if (this.bird.angle < 20)
            this.bird.angle += 1;

        if (this.mouseIsDown == true) {
            //get the distance between the start and end point
            var distY = Math.abs(game.input.y - this.startY);
            //if the distance is greater than 50 pixels then a swipe has happened
            if (distY > 50) {
                this.swipeDone();
            }
        }

    },

    jump: function() {
        // If the bird is dead, he can't jump
        if (this.bird.alive == false)
            return;

        this.bird.body.velocity.y = -200;

        // Jump animation
        game.add.tween(this.bird).to({
            angle: -20
        }, 100).start();

    },

    dive: function() {
        // If the bird is dead, he can't dive
        if (this.bird.alive == false)
            return;

        this.bird.body.velocity.y = +100;

        // Jump animation
        game.add.tween(this.bird).to({
            angle: -20
        }, 100).start();

    },

    hitPipe: function() {
        // If the bird has already hit a pipe, we have nothing to do
        if (this.bird.alive == false)
            return;

        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);

        // Go through all the pipes, and stop their movement
        this.pipes.forEach(function(p) {
            p.body.velocity.x = 0;
        }, this);

        // Go through all the floors, and stop their movement
        this.floors.forEach(function(p) {
            p.body.velocity.x = 0;
        }, this);
    },

    restartGame: function() {
        game.state.start('main');
    },

    addOnePipe: function(x, y) {
        var pipe;
        if (Math.round(y) % 2 == 0) {
            pipe = game.add.sprite(x, y, 'flipy');
            pipe.scale.setTo(1.7, 1.7);
        } else {
            pipe = game.add.sprite(x, y, 'pipe');
            pipe.scale.setTo(0.6, 0.6);
	}
        this.pipes.add(pipe);
        game.physics.arcade.enable(pipe);

        pipe.body.velocity.x = -200;
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;

    },

    addRowOfPipes: function() {
        this.addOnePipe(800, 0 + (Math.random() * (400 - 100) + 100));
        this.labelScore.text = this.score;
        this.score += 1;
    },

    addOneSeaweed: function(x, y) {
        var floor = game.add.sprite(x, y, 'floor');
        floor.scale.setTo(6.5, 6.5);
        this.floors.add(floor);
        game.physics.arcade.enable(floor);

        // Make the seaweed a little slower than the fish.
        floor.body.velocity.x = -170;
        floor.checkWorldBounds = true;
        floor.outOfBoundsKill = true;
    },

    addRowOfSeaweed: function() {
        this.addOneSeaweed(800, 400);
    },

    mouseDown: function() {
        //set the mouseIsDown to true
        this.mouseIsDown = true;
        //record the place the mouse started
        this.startY = game.input.y;
    },
    mouseUp: function() {
        this.mouseIsDown = false;
    },
    swipeDone: function() {
        //get the ending point
        var endY = game.input.y;
        //check the start point against the end point
        if (endY < this.startY) {
            //this.text1.text = "Swiped up";
            this.jump();
        } else {
            //this.text1.text = "Swiped down";
            //downKey.onDown.add(this.dive, this);
            this.dive();
        }
    },

};

game.state.add('main', mainState);
game.state.start('main');
