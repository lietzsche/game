import Phaser from 'phaser';

// 1. 게임 설정
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'app', // index.html의 <div id="app">에 렌더링
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: preload,
        create: create
    }
};

// 2. 게임 인스턴스 생성
new Phaser.Game(config);

function preload(this: Phaser.Scene) {
    // 이미지를 로드할 때 (Vite는 public 폴더를 루트로 인식합니다)
    this.load.setBaseURL('https://labs.phaser.io');
    this.load.image('sky', 'assets/skies/space3.png');
    this.load.image('logo', 'assets/sprites/phaser3-logo.png');
    this.load.image('red', 'assets/particles/red.png');
}

function create(this: Phaser.Scene) {
    this.add.image(400, 300, 'sky');

    const particles = this.add.particles(0, 0, 'red', {
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
    });

    const logo = this.physics.add.image(400, 100, 'logo');
    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    particles.startFollow(logo);
}