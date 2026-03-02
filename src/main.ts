import Phaser from 'phaser';

// 게임 장면(Scene) 정의
class SamuraiScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private dashKey!: Phaser.Input.Keyboard.Key;
  private isAttacking: boolean = false;
  private isBlocking: boolean = false;

  constructor() {
    super('SamuraiScene');
  }

  preload() {
    // AI가 생성한 예쁜 붓글씨 느낌의 스틱맨 무사 캐릭터
    // 실제 이미지 크기: 640x640. 4x4 그리드이므로 프레임당 160x160
    this.load.spritesheet('samurai',
      '/assets/cool_stickman.png',
      { frameWidth: 160, frameHeight: 160 }
    );
  }

  create() {
    // 1. 물리 엔진이 적용된 캐릭터 생성
    this.player = this.physics.add.sprite(100, 450, 'samurai');

    // 2. 화면 밖으로 나가지 않게 설정
    this.player.setCollideWorldBounds(true);
    // 캐릭터 박스 크기 조정 (160x160 프레임 안에서 실제 캐릭터가 차지하는 비율 고려)
    this.player.setSize(50, 120);
    // 화면 크기에 맞게 스케일 조정 (160px면 꽤 크므로 약간 줄임)
    this.player.setScale(0.8);

    // 3. 애니메이션 설정

    // 대기 상태 (Idle) - 첫 줄
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('samurai', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });

    // 걷기 (Run/Walk) - 두 번째 줄
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('samurai', { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    // 공격 (Attack) - 세 번째 줄
    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('samurai', { start: 8, end: 11 }),
      frameRate: 15,
      repeat: 0 // 반복하지 않음
    });

    // 점프/방어 등 - 네 번째 줄 활용하지만 칼질 안하는 프레임 찾기
    // (보통 1, 5번 프레임이 공중에 떠있는 느낌을 줄 수 있습니다)
    this.anims.create({
      key: 'jump',
      frames: [{ key: 'samurai', frame: 5 }], // 뛰는 동작 중 하나를 점프로 사용
      frameRate: 10,
      repeat: -1
    });

    // 방어 (Block)
    this.anims.create({
      key: 'block',
      frames: [{ key: 'samurai', frame: 14 }], // 14번 대신 다른 게 나을 수도 있지만 일단 유지
      frameRate: 20
    });

    // 기본 애니메이션 실행
    this.player.anims.play('idle');

    // 4. 입력 키 설정
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      // 스페이스바로 공격
      this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      // 쉬프트키로 달리기 (Dash)
      this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }

    // 애니메이션 완료 이벤트 (공격 끝날 때 처리)
    this.player.on('animationcomplete-attack', () => {
      this.isAttacking = false;
    });
  }

  update() {
    // 이미 공격 중이라면 다른 동작 불가
    if (this.isAttacking) {
      this.player.setVelocityX(0); // 공격 중 이동 불가
      return;
    }

    // 방어 로직 (아래 방향키 누르고 있을 때)
    if (this.cursors.down.isDown && this.player.body.blocked.down) {
      this.isBlocking = true;
      this.player.setVelocityX(0); // 방어 중 이동 불가
      this.player.anims.play('block', true);
      return; // 방어 중에는 점프/공격 불가
    } else {
      this.isBlocking = false;
    }

    // 공격 로직 (스페이스바)
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && this.player.body.blocked.down) {
      this.isAttacking = true;
      this.player.anims.play('attack', true);
      return;
    }

    // 달리기 속도 설정 (Shift 누르면 350, 아니면 기본 걷기 180)
    const speed = this.dashKey.isDown ? 350 : 180;
    // 달리기 중이면 애니메이션 속도도 빠르게
    const animSpeedMultiplier = this.dashKey.isDown ? 1.5 : 1;

    // 이동 로직
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true); // 왼쪽을 보게 이미지 반전
      if (this.player.body.blocked.down) {
        this.player.anims.play('run', true);
        this.player.anims.msPerFrame = 100 / animSpeedMultiplier; // 애니메이션 속도 조절
      }
    }
    else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false); // 오른쪽을 보게 이미지 원상복구
      if (this.player.body.blocked.down) {
        this.player.anims.play('run', true);
        this.player.anims.msPerFrame = 100 / animSpeedMultiplier; // 애니메이션 속도 조절
      }
    }
    else {
      this.player.setVelocityX(0);
      if (this.player.body.blocked.down) {
        this.player.anims.play('idle', true);
      }
    }

    // 공중에 있을 때의 애니메이션
    if (!this.player.body.blocked.down) {
      this.player.anims.play('jump', true);
    }

    // 점프 (바닥에 닿아있을 때만 가능)
    if (this.cursors.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-400); // 점프력도 살짝 상향
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