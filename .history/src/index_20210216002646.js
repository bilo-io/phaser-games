import Phaser from 'phaser';
import logoImg from './assets/logo.png';
import background from './assets/images/backgrounds/1.jpg'
import pongPaddle from './assets/images/pong/pong-paddle.png'
import pongBall from './assets/images/pong/pong-ball.png'
import pongLine from './assets/images/pong/dotted-line.png'

var sceneWidth = 800
var sceneHeight = 600
var ballObj
var player1
var player1Goal
var player1Score = 0
var player1ScoreText
var player2
var player2Goal
var player2Score = 0
var player2ScoreText


const useParticles = true

const getLength = (obj) => {
    return Math.sqrt(obj.x * obj.x + obj.y * obj.y)
}

const getPositionDiff = (obj1, obj2) => ({
    x: obj1.x - obj2.x,
    y: obj1.y - obj2.y
})

const getNormalized = (vector) => ({
    x: vector.x / getLength(vector),
    y: vector.y / getLength(vector),
})

const getRandomDirection = () => ({
    x: Math.random() > 0.5 ? 1 : -1,
    y: Math.random() > 0.5 ? 1 : -1
})

class MyGame extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    //#region LifeCycle
    preload ()
    {
        this.load.image('logo', logoImg);
        this.load.image('background', background);
        this.load.image('wall', pongPaddle)
        this.load.image('ball', pongBall)
        this.load.image('line', pongLine)
    }

    create ()
    {
        const background = this.add.image(sceneWidth / 2,sceneHeight / 2, 'background');
        const playerDistance = 90
        const paddleSize = 38
        const ballSpeed = 40
        const ballVelocity = {
            x: Math.max(0.7, Math.random()) * ballSpeed * 10,
            y: Math.max(0.4, Math.random()) * ballSpeed * 5
        }
        const enemyPosition = sceneWidth - playerDistance

        // Player 1
        player1 = this.physics.add
            .image(2 * playerDistance - paddleSize, sceneHeight / 2, 'wall')
            .setScale(0.5)
            .setBounce(0)
            .refreshBody()
        player1.setCollideWorldBounds(true)
        player1Goal = this.physics.add
            .image(playerDistance - paddleSize, sceneHeight / 2, 'line')
            .setScale(0.3)
            .setBounce(0)
            .refreshBody()
        player1ScoreText = this.add.text(2 * playerDistance - paddleSize, 10, '', { font: '64px Courier', fill: '#fff' })

        // Player 2
        player2 = this.physics.add
            .image(sceneWidth - 2 * playerDistance + paddleSize, sceneHeight / 2, 'wall')
            .setScale(0.5)
            .setBounce(0)
            .refreshBody()
        player2.setCollideWorldBounds(true)
        player2Goal = this.physics.add
            .image(sceneWidth - playerDistance + paddleSize, sceneHeight / 2, 'line')
            .setScale(0.3)
            .setBounce(0)
            .refreshBody()
        player2ScoreText = this.add.text(sceneWidth - 2 * playerDistance, 10, '', { font: '64px Courier', fill: '#fff' })


        // Ball
        ballObj = this.physics.add
            .image(sceneWidth / 2, sceneHeight / 2, 'ball')
            .setScale(0.5)
            .setVelocity(ballVelocity.x, ballVelocity.y)
            .setMass(0.001)
            .setBounce(0.5)
            .refreshBody()
        ballObj.setCollideWorldBounds(true)

        //#region Particles
        if(useParticles) {
            var particles = this.add.particles('blue')
            var emitter1 = particles.createEmitter({
                speed: 100,
                scale: { start: 1, end: 0 },
                blendMode: 'ADD'
            });
            emitter1.startFollow(player1)
        }
        //#endregion

        //#region Physics
        const collideWithPlayer = (direction) => (player, ball) => {
            const diff = getPositionDiff(ball, player);
            ball.setVelocity(direction * ballVelocity.x, getNormalized(diff).y * ballSpeed * 3)
            player.setVelocityX(0)
        }

        const collideWithGoal = (goal, ball) => {
            ball.x = sceneWidth / 2
            ball.y = sceneHeight / 2
            const direction = getRandomDirection()
            ball.setVelocity(direction.x * ballVelocity.x, direction.y * ballVelocity.y)
            goal.setVelocityX(0)
        }

        this.physics.add.collider(player1, ballObj, collideWithPlayer(1))
        this.physics.add.collider(player1Goal, ballObj, (goal, ball) => {
            collideWithGoal(goal, ball)
            player2Score++
        })
        this.physics.add.collider(player2, ballObj, collideWithPlayer(-1))
        this.physics.add.collider(player2Goal, ballObj, (goal, ball) => {
            collideWithGoal(goal,ball)
            player1Score++
        })
        //#endregion
    }

    update ()
    {
        // Winning condition
        const winningScore = 3
        if (player1Score >= winningScore) {
            console.log('player1 wins')
            this.resetGame()
        } else if (player2Score >= winningScore) {
            console.log('player2 wins')
            this.resetGame()
        }
        const cursors = this.input.keyboard.addKeys({
            // Player1
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            // Player2
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            down: Phaser.Input.Keyboard.KeyCodes.DOWN,
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            // Misc
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        })

        //#region Controls
        const paddleSpeed = 250;
        // RESTART GAME
        if (cursors.space.isDown) {
            this.resetGame()
        }
        // Player 1
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

        // Player 2
        if (cursors.w.isDown)
        {
            player1.setVelocityY(-paddleSpeed)
        }
        else if (cursors.s.isDown)
        {
            player1.setVelocityY(paddleSpeed)
        }
        else
        {
            player1.setVelocityY(0)
        }
        //#endregion

        //#region UI
        player1ScoreText.setText(player1Score)
        player2ScoreText.setText(player2Score)
        //#endregion
    }
    //#endregion
    resetGame () {
        ballObj.x = sceneWidth / 2
        player1.y = sceneHeight / 2
        player2.y = sceneHeight / 2
        player1Score = 0
        player2Score = 0
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
            debug: false
        }
    },
    scene: MyGame,

};

const game = new Phaser.Game(config);
