import Phaser from 'phaser';

// 게임 장면(Scene) 정의
class SamuraiScene extends Phaser.Scene {
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super('SamuraiScene');
    }

    preload() {
        // 임시 무사 캐릭터 (Phaser 로고 대신 듀드 캐릭터 사용)
        this.load.spritesheet('samurai', 
            'https://labs.phaser.io/assets/sprites/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    create() {
        // 1. 물리 엔진이 적용된 캐릭터 생성
        this.player = this.physics.add.sprite(100, 450, 'samurai');

        // 2. 화면 밖으로 나가지 않게 설정
        this.player.setCollideWorldBounds(true);

        // 3. 애니메이션 설정 (좌, 정면, 우)
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('samurai', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'samurai', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('samurai', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        // 4. 키보드 입력 활성화
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }
    }

    update() {
        // 5. 실시간 이동 로직
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } 
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } 
        else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        // 점프 (바닥에 닿아있을 때만 가능)
        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-330);
        }
    }
}

// 게임 설정 및 실행
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'app',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 600 }, // 중력 설정
            debug: true // 충돌 박스를 시각적으로 확인 (개발용)
        }
    },
    scene: SamuraiScene
};

new Phaser.Game(config);