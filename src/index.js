import Phaser from 'phaser';
import logoImg from './assets/logo.png';
import background from './assets/images/backgrounds/1.jpg'
import pongSpriteSheet from './assets/images/pong/spritesheet.png'
import pongPaddle from './assets/images/pong/pong-paddle.png'
import pongBall from './assets/images/pong/pong-ball.png'

var sceneWidth = 800
var sceneHeight = 600
var player1
var player2
var ball
class MyGame extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    preload ()
    {
        this.load.image('logo', logoImg);
        this.load.image('background', background);
        this.load.image('wall', pongPaddle)
        this.load.image('ball', pongBall)
    }

    create ()
    {
        const background = this.add.image(400,300, 'background');
        const playerDistance = 30
        const playerPosition = 30
        const ballSpeed = 30
        const ballVelocity = {
            x: Math.random() * ballSpeed * 12,
            y: Math.random() * ballSpeed * 4
        }
        const enemyPosition = sceneWidth - playerDistance

        // Player 1
        player1 = this.physics.add
            .image(playerDistance, sceneHeight / 2, 'wall')
            .setScale(0.5)
            .setBounce(0)
            .refreshBody()
        player1.setCollideWorldBounds(true)

        // Player 2
        player2 = this.physics.add
            .image(sceneWidth - playerDistance * 1.5, sceneHeight / 2, 'wall')
            .setScale(0.5)
            .setBounce(0)
            .refreshBody()
        player2.setCollideWorldBounds(true)

        ball = this.physics.add
            .image(sceneWidth / 2, sceneHeight / 2, 'ball')
            .setScale(0.5)
            .setVelocity(ballVelocity.x, ballVelocity.y)
            .setMass(0.001)
            .setBounce(0.5)
            .refreshBody()
        ball.setCollideWorldBounds(true)

        // Particles
        var particles = this.add.particles('blue')
        var emitter1 = particles.createEmitter({
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        });
        var emitter2 = particles.createEmitter({
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        });
        emitter1.startFollow(player1)
        emitter2.startFollow(player2)

        this.physics.add.collider(player1, ball, (playerObj, ballObj) => {
            playerObj.setVelocityX(0)
            ball.setVelocityX(ballVelocity.x)
        })
        this.physics.add.collider(player2, ball, (playerObj, ballObj) => {
            playerObj.setVelocityX(0)
            ball.setVelocityX(-ballVelocity.x)
        })
    }

    update ()
    {
        const cursors = this.input.keyboard.createCursorKeys();
        const otherKeys = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
        })
        const paddleSpeed = 250;

        if (cursors.up.isDown)
        {
            player2.setVelocityY(-paddleSpeed);
        }
        else if (cursors.down.isDown)
        {
            player2.setVelocityY(paddleSpeed);
        }
        else
        {
            player2.setVelocityY(0);
        }

        if (otherKeys.w.isDown)
        {
            player1.setVelocityY(-paddleSpeed)
        }
        else if (otherKeys.s.isDown)
        {
            player1.setVelocityY(paddleSpeed)
        }
        else
        {
            player1.setVelocityY(0)
        }

    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,//screen.width,
    height: 600, //screen.height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scene: MyGame,

};

const game = new Phaser.Game(config);
