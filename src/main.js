import Phaser from 'phaser';

const gameState = {
    level: 1,
    hp: 100,
    maxHp: 100,
    atk: 45,
    currentStoryStep: 0,
    targetDistance: 15000,
    gameActive: false,
    isDialogueActive: false
};

const stories = [
    { dist: 0, name: "무사", text: "나의 검은 붓과 같아, 춤추듯 휘두르면 절경이 펼쳐지지." },
    { dist: 3000, name: "그림자 칼잡이", text: "연속된 초식... 훌륭하군. 정면에서 승부하자." },
    { dist: 3010, name: "무사", text: "나의 묵선은 굽히지 않는다. 횡과 종을 섞어 네놈을 베어주마." },
    { dist: 8000, name: "심연의 수호자", text: "네놈의 화려한 칼질도 이 어둠 속에선 무의미하다!" },
    { dist: 14500, name: "무사", text: "보라. 선과 선이 모여 면을 이루고, 마침내 하나의 진리가 되었노라." }
];

let terrainPoints = [
    { x: 0, y: 0 }, { x: 2500, y: 0 }, { x: 4500, y: -200 }, { x: 6500, y: 100 },
    { x: 9500, y: -350 }, { x: 12500, y: -150 }, { x: 15000, y: -450 }
];

class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() { }
    create() { this.scene.start('GameScene'); }
}

class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    create() {
        this.worldX = 0;
        this.baseGroundY = this.scale.height * 0.82;
        this.screenShake = 0;

        // Background graphics
        this.bgGraphics = this.add.graphics();
        this.bgGraphics.setScrollFactor(0);

        // Dynamic drawing graphics (player, enemies, etc)
        this.drawGraphics = this.add.graphics();

        // Player Object
        this.player = {
            x: 250, y: 0, width: 30, height: 120, vy: 0,
            jumpPower: -17.5, gravity: 0.62, isJumping: false,
            walkSpeed: 6.0, runSpeed: 17.0, speed: 6.0,
            isRunning: false, isGuarding: false, dir: 1,
            state: 'idle', isAttacking: false, attackFrame: 0,
            attackType: null, combo: 0, comboTimer: 0,
            scarfNodes: [], invulFrame: 0, animTimer: 0
        };

        // Arrays for entities
        this.enemies = [];
        this.particles = [];
        this.inkBlots = [];
        this.ghosts = [];
        this.platforms = [];
        this.obstacles = [];
        this.lastMapX = 1200;

        this.player.y = this.getTerrainY(this.worldX + this.player.x) - this.player.height;
        for (let i = 0; i < 15; i++) this.player.scarfNodes.push({ x: this.player.x, y: this.player.y });

        // Input bindings
        this.keys = this.input.keyboard.addKeys('W,A,S,D,F,R,SHIFT,SPACE,UP,DOWN,LEFT,RIGHT');

        // HTML Elements bindings
        this.hpBar = document.getElementById('hp-bar');
        this.storyProgressUI = document.getElementById('story-progress');
        this.guardStatus = document.getElementById('guard-status');
        this.dialogueBox = document.getElementById('dialogue-box');
        this.dialogueName = document.getElementById('dialogue-name');
        this.dialogueText = document.getElementById('dialogue-text');
        this.msgBox = document.getElementById('msg-box');

        // Mobile Keys
        this.mobileKeys = { left: false, right: false, run: false, guard: false };
        this.bindBtn('btn-left', 'left'); this.bindBtn('btn-right', 'right');
        this.bindBtn('btn-run', 'run'); this.bindBtn('btn-guard', 'guard');

        document.getElementById('btn-jump').ontouchstart = (e) => { e.preventDefault(); this.playerJump(); };
        document.getElementById('btn-attack').ontouchstart = (e) => { e.preventDefault(); this.playerAttack('light'); };
        document.getElementById('btn-heavy').ontouchstart = (e) => { e.preventDefault(); this.playerAttack('heavy'); };

        this.dialogueBox.addEventListener('click', () => {
            if (!gameState.isDialogueActive) return;
            gameState.isDialogueActive = false;
            this.dialogueBox.style.display = 'none';
            gameState.gameActive = true;
        });

        // Handle space/enter for dialogue
        this.input.keyboard.on('keydown', () => {
            if (gameState.isDialogueActive) {
                gameState.isDialogueActive = false;
                this.dialogueBox.style.display = 'none';
                gameState.gameActive = true;
            }
        });

        gameState.gameActive = true;
    }

    bindBtn(id, key) {
        const el = document.getElementById(id);
        if (el) {
            el.ontouchstart = (e) => { e.preventDefault(); this.mobileKeys[key] = true; };
            el.ontouchend = () => this.mobileKeys[key] = false;
        }
    }

    getTerrainY(wX) {
        for (let i = 0; i < terrainPoints.length - 1; i++) {
            const p1 = terrainPoints[i]; const p2 = terrainPoints[i + 1];
            if (wX >= p1.x && wX <= p2.x) {
                const ratio = (wX - p1.x) / (p2.x - p1.x);
                return this.baseGroundY + p1.y + (p2.y - p1.y) * ratio;
            }
        }
        return this.baseGroundY + terrainPoints[terrainPoints.length - 1].y;
    }

    playerJump() {
        if (!this.player.isJumping && !this.player.isGuarding) {
            this.player.vy = this.player.jumpPower; this.player.isJumping = true;
        }
    }

    playerAttack(type = 'light') {
        if (this.player.isAttacking || gameState.isDialogueActive || this.player.isGuarding || !gameState.gameActive) return;
        this.player.isAttacking = true; this.player.attackFrame = 0; this.player.attackType = type;
        if (type === 'light') {
            if (this.player.comboTimer > 0) this.player.combo = (this.player.combo + 1) % 3;
            else this.player.combo = 0;
            this.player.comboTimer = 45;
        }
        const range = (type === 'heavy' || this.player.combo === 2) ? 260 : (this.player.combo === 1 ? 210 : 180);
        const damage = type === 'heavy' ? gameState.atk * 4 : (this.player.combo === 2 ? gameState.atk * 2.5 : gameState.atk);

        this.enemies.forEach(en => {
            const sEX = en.worldPos - this.worldX;
            const dx = sEX - this.player.x;
            const isDir = (this.player.dir === 1 && dx > 0) || (this.player.dir === -1 && dx < 0);
            if (Math.abs(dx) < range && isDir && Math.abs(en.y - (this.player.y + 60)) < 220) {
                this.enemyTakeDamage(en, damage, this.player.dir * (type === 'heavy' || this.player.combo === 2 ? 55 : 25));
                this.addShake(this.player.combo === 2 || type === 'heavy' ? 38 : 18);
            }
        });
    }

    enemyTakeDamage(en, amt, kb) {
        en.hp -= amt;
        if (!this.player.isGuarding) en.knockback = kb;
        this.createParticles(en.worldPos - this.worldX, en.y, 0x550000, 18, 6);
        if (en.hp <= 0) {
            this.createInkBlot(en.worldPos, this.getTerrainY(en.worldPos));
            this.createParticles(en.worldPos - this.worldX, en.y, 0x000000, 60, 10);
        }
    }

    playerTakeDamage(amt) {
        gameState.hp -= amt;
        this.createParticles(this.player.x, this.player.y + 60, 0x000000, 25, 5);
        this.hpBar.style.width = `${(gameState.hp / gameState.maxHp) * 100}%`;
        if (gameState.hp <= 0) {
            gameState.gameActive = false;
            this.msgBox.style.display = 'block';
        }
    }

    addShake(amt) {
        this.screenShake = Math.max(this.screenShake, amt);
    }

    createParticles(x, y, color, count, speed) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * speed * 3,
                vy: (Math.random() - 0.5) * speed * 3,
                life: 1.0, color, size: Math.random() * 7 + 2
            });
        }
    }

    createInkBlot(worldXPos, y) {
        this.inkBlots.push({ worldX: worldXPos, y: y, size: Math.random() * 80 + 60, life: 1.0, rot: Math.random() * Math.PI * 2 });
    }

    checkStory() {
        const next = stories[gameState.currentStoryStep];
        if (next && this.worldX >= next.dist && gameState.gameActive) {
            gameState.isDialogueActive = true;
            this.dialogueBox.style.display = 'block';
            this.dialogueName.innerText = next.name;
            this.dialogueText.innerText = next.text;
            gameState.currentStoryStep++;
            gameState.gameActive = false;
        }
    }

    updateMap() {
        const width = this.scale.width;
        if (this.worldX + width + 1500 > this.lastMapX) {
            const x = this.lastMapX + 700 + Math.random() * 500;
            this.platforms.push({ worldX: x, yOffset: -200 - Math.random() * 250, w: 350 + Math.random() * 450, h: 25 });
            if (Math.random() < 0.5) this.obstacles.push({ worldX: x + 180, w: 60, h: 30, type: 'spikes' });
            this.lastMapX = x + 600;
        }
        this.platforms = this.platforms.filter(p => p.worldX - this.worldX > -width);
        this.obstacles = this.obstacles.filter(o => o.worldX - this.worldX > -width);
    }

    spawnEnemy() {
        const r = Math.random();
        let type = r < 0.45 ? 'ghoul' : (r < 0.8 ? 'oni' : 'shadow');
        let hp, speed, radius, yOff;
        switch (type) {
            case 'ghoul': hp = 100; speed = 2.5; radius = 25; yOff = 30; break;
            case 'oni': hp = 600; speed = 1.3; radius = 55; yOff = 60; break;
            case 'shadow': hp = 180; speed = 3.5; radius = 30; yOff = 30; break;
        }
        this.enemies.push({
            type, hp, maxHp: hp, speed, radius, knockback: 0,
            worldPos: this.worldX + this.scale.width + 600,
            y: 0,
            yOff
        });
    }

    updatePlayer() {
        const p = this.player;
        p.isGuarding = (this.keys.S.isDown || this.keys.DOWN.isDown || this.mobileKeys.guard) && !p.isJumping;
        p.isRunning = (this.keys.SHIFT.isDown || this.mobileKeys.run) && !p.isGuarding;
        p.speed = p.isRunning ? p.runSpeed : (p.isGuarding ? p.walkSpeed * 0.4 : p.walkSpeed);

        const animFreq = p.isRunning ? 0.04 : (p.isGuarding ? 0.01 : 0.02);
        p.animTimer += p.speed * animFreq;

        let isMoving = false;
        if (!p.isAttacking) {
            if (this.keys.D.isDown || this.keys.RIGHT.isDown || this.mobileKeys.right) { this.worldX += p.speed; p.dir = 1; isMoving = true; }
            else if (this.keys.A.isDown || this.keys.LEFT.isDown || this.mobileKeys.left) { if (this.worldX > 0) this.worldX -= p.speed; p.dir = -1; isMoving = true; }

            if (this.keys.SPACE.isDown || this.keys.W.isDown || this.keys.UP.isDown) this.playerJump();
            if (Phaser.Input.Keyboard.JustDown(this.keys.F)) this.playerAttack('light');
            if (Phaser.Input.Keyboard.JustDown(this.keys.R)) this.playerAttack('heavy');
        }

        this.guardStatus.style.opacity = p.isGuarding ? "1" : "0";

        if (p.isAttacking) {
            if (p.attackFrame < 10) this.worldX += (p.combo === 2 ? 15 : 5) * p.dir;
        }
        else if (p.isJumping) p.state = 'jump';
        else if (p.isGuarding) p.state = 'guard';
        else if (isMoving) p.state = p.isRunning ? 'run' : 'walk';
        else p.state = 'idle';

        p.vy += p.gravity;
        p.y += p.vy;
        const currentGroundY = this.getTerrainY(this.worldX + p.x);
        if (p.y + p.height > currentGroundY) {
            if (p.isJumping) { this.createParticles(p.x, currentGroundY, 0xaaaaaa, 12, 1.5); this.addShake(6); }
            p.y = currentGroundY - p.height; p.vy = 0; p.isJumping = false;
        }

        this.platforms.forEach(plat => {
            const screenX = plat.worldX - this.worldX;
            const pY = this.getTerrainY(plat.worldX) + plat.yOffset;
            if (p.x + 10 > screenX && p.x - 10 < screenX + plat.w) {
                if (p.vy >= 0 && p.y + p.height <= pY + 20 && p.y + p.height >= pY - 10) {
                    if (p.isJumping) { this.createParticles(p.x, pY, 0xaaaaaa, 6, 1); this.addShake(3); }
                    p.y = pY - p.height; p.vy = 0; p.isJumping = false;
                }
            }
        });

        if (p.invulFrame <= 0) {
            this.obstacles.forEach(obs => {
                const screenX = obs.worldX - this.worldX; const oY = this.getTerrainY(obs.worldX);
                if (Math.abs(p.x - (screenX + obs.w / 2)) < 30 && p.y + p.height > oY - 15 && p.y < oY) {
                    let dmg = 15;
                    if (p.isGuarding) { dmg *= 0.3; this.createParticles(p.x, p.y + 60, 0xffcc00, 5, 1.5); }
                    else { p.vy = -10; this.addShake(15); }
                    this.playerTakeDamage(dmg); p.invulFrame = 50;
                }
            });
        } else { p.invulFrame--; }

        const scarfBaseX = p.x - (10 * p.dir); const scarfBaseY = p.y + 25;
        p.scarfNodes[0] = { x: scarfBaseX, y: scarfBaseY };
        for (let i = 1; i < p.scarfNodes.length; i++) {
            const node = p.scarfNodes[i]; const prev = p.scarfNodes[i - 1];
            const lerp = p.state === 'run' ? 0.6 : 0.35;
            node.x += (prev.x - (p.dir * 4) - node.x) * lerp;
            node.y += (prev.y - node.y) * lerp + Math.sin(Date.now() * 0.02 + i) * 0.7;
        }

        if (p.isAttacking) {
            p.attackFrame++;
            const maxF = (p.attackType === 'heavy' || p.combo === 2) ? 26 : 16;
            if (p.attackFrame > maxF) { p.isAttacking = false; p.attackFrame = 0; }
        }
        if (p.comboTimer > 0) p.comboTimer--; else p.combo = 0;

        if ((p.state === 'run' || (p.isAttacking && p.combo === 2)) && Math.random() < 0.7) {
            this.ghosts.push({ worldX: this.worldX + p.x, y: p.y, life: 0.6, dir: p.dir, state: p.state, animTimer: p.animTimer, vy: p.vy });
        }
    }

    update(time, delta) {
        if (gameState.isDialogueActive) return;

        if (gameState.gameActive) {
            this.updatePlayer();
            this.checkStory();
            this.updateMap();
        }

        this.enemies.forEach(e => {
            if (e.knockback !== 0) { e.worldPos += e.knockback; e.knockback *= 0.88; if (Math.abs(e.knockback) < 0.5) e.knockback = 0; }
            else { e.worldPos -= e.speed; }
            e.y = this.getTerrainY(e.worldPos) - e.yOff;
            const sX = e.worldPos - this.worldX;
            if (Math.abs(sX - this.player.x) < e.radius + 20 && Math.abs(e.y - (this.player.y + 60)) < 80) {
                if (this.player.invulFrame <= 0) {
                    let dmg = e.type === 'oni' ? 35 : 18;
                    if (this.player.isGuarding) { dmg *= 0.2; this.createParticles(this.player.x + this.player.dir * 35, this.player.y + 60, 0xffbb00, 8, 2); this.addShake(4); }
                    else { e.knockback = 20; this.addShake(20); }
                    this.playerTakeDamage(dmg); this.player.invulFrame = 45;
                }
            }
        });

        this.enemies = this.enemies.filter(e => e.hp > 0 && e.worldPos - this.worldX > -800);
        if (gameState.gameActive && Math.random() < 0.01 && this.enemies.length < 5) this.spawnEnemy();

        for (let i = this.ghosts.length - 1; i >= 0; i--) { this.ghosts[i].life -= 0.12; if (this.ghosts[i].life <= 0) this.ghosts.splice(i, 1); }
        for (let i = this.inkBlots.length - 1; i >= 0; i--) { this.inkBlots[i].life -= 0.01; if (this.inkBlots[i].life <= 0) this.inkBlots.splice(i, 1); }
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.04;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        if (this.screenShake > 0) this.screenShake *= 0.82;
        const prog = Math.min(100, Math.floor((this.worldX / gameState.targetDistance) * 100));
        this.storyProgressUI.innerText = `Progress: ${prog}%`;

        this.customDraw();
    }

    // --- DRAWING PORT ---

    drawLimb(g, x1, y1, angle1, angle2, l1, l2) {
        const x2 = x1 + Math.cos(angle1) * l1; const y2 = y1 + Math.sin(angle1) * l1;
        const x3 = x2 + Math.cos(angle1 + angle2) * l2; const y3 = y2 + Math.sin(angle1 + angle2) * l2;
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x3, y3); g.strokePath();
        return { x: x3, y: y3 };
    }

    drawPlayer(g, overrideAlpha, isGhost, ghostState) {
        const p = this.player;
        const curState = isGhost ? ghostState.state : p.state;
        const curAnim = isGhost ? ghostState.animTimer : p.animTimer;
        const curDir = isGhost ? ghostState.dir : p.dir;
        const curVy = isGhost ? ghostState.vy : p.vy;

        if (!isGhost && p.invulFrame > 0 && Math.floor(Date.now() / 80) % 2 === 0) return;

        g.save();
        const bPX = isGhost ? ghostState.worldX - this.worldX : p.x;
        const bPY = isGhost ? ghostState.y : p.y;

        g.translateCanvas(bPX, bPY);
        g.scaleCanvas(curDir, 1);

        g.lineStyle(6, 0x000000, overrideAlpha);
        g.fillStyle(0x000000, overrideAlpha);

        let bounce = Math.sin(curAnim * 0.5) * 4;
        if (curState === 'idle' || curState === 'guard') bounce = Math.sin(Date.now() * 0.003) * 1.2;

        const hY = 20 + bounce;
        g.beginPath(); g.moveTo(-25, hY - 5); g.lineTo(25, hY - 5); g.lineTo(0, hY - 25);
        g.fillPath();
        g.beginPath(); g.arc(0, hY, 8, 0, Math.PI * 2); g.strokePath();

        const torsoLen = 45;
        let pX = (curState === 'run' ? -12 : 0);
        let pY = hY + torsoLen;

        if (p.isAttacking && !isGhost) {
            if (p.combo === 0) pX = 8;
            else if (p.combo === 1) pX = -5;
            else pX = 15;
        }

        g.beginPath(); g.moveTo(0, hY + 8); g.lineTo(pX, pY); g.strokePath();

        let lA1, lA2, rA1, rA2;
        if (curState === 'idle' || curState === 'guard') {
            lA1 = 1.52; lA2 = 0.05; rA1 = 1.62; rA2 = -0.05;
        } else if (curState === 'run') {
            const cyc = curAnim;
            lA1 = Math.PI / 2 + Math.sin(cyc) * 1.1; lA2 = -Math.PI / 4 + Math.sin(cyc - 1) * 0.8;
            rA1 = Math.PI / 2 + Math.sin(cyc + Math.PI) * 1.1; rA2 = -Math.PI / 4 + Math.sin(cyc + Math.PI - 1) * 0.8;
        } else if (curState === 'jump') {
            if (curVy < -5) { lA1 = 0.8; lA2 = 1.2; rA1 = 2.3; rA2 = -1.2; }
            else { lA1 = 1.4; lA2 = 0.2; rA1 = 1.7; rA2 = -0.2; }
        } else {
            const cyc = curAnim;
            lA1 = Math.PI / 2 + Math.sin(cyc) * 0.55; lA2 = 0.3; rA1 = Math.PI / 2 + Math.sin(cyc + Math.PI) * 0.55; rA2 = 0.3;
        }

        this.drawLimb(g, pX, pY, lA1, lA2, 35, 35);
        this.drawLimb(g, pX, pY, rA1, rA2, 35, 35);

        let hand;
        if (!isGhost && p.isAttacking) {
            const maxF = p.attackType === 'heavy' ? 24 : (p.combo === 2 ? 22 : 14);
            const prg = p.attackFrame / maxF;
            let sA, eA;

            if (p.attackType === 'heavy') { sA = -1.5; eA = 1.0; }
            else if (p.combo === 0) { sA = -2.2; eA = 0.8; }
            else if (p.combo === 1) { sA = -0.5; eA = 0.5; }
            else { sA = -0.1; eA = 0.1; }

            const swing = sA + (eA - sA) * prg;
            const elbowA = (p.combo === 1) ? 0.8 : 0.2;
            hand = this.drawLimb(g, 0, hY + 12, swing, elbowA, 32, 32);

            g.lineStyle(7, 0x000000, overrideAlpha);
            g.beginPath(); g.moveTo(hand.x, hand.y);
            let bladeLen = (p.combo === 2) ? 120 : 100;
            g.lineTo(hand.x + Math.cos(swing) * bladeLen, hand.y + Math.sin(swing) * bladeLen);
            g.strokePath();
        } else if (curState === 'guard') {
            hand = this.drawLimb(g, 0, hY + 12, 0.4, 0.8, 25, 25);
            g.lineStyle(5, 0x000000, overrideAlpha);
            g.beginPath(); g.moveTo(hand.x, hand.y); g.lineTo(hand.x + 10, hand.y - 80); g.strokePath();
        } else {
            let aA = curState === 'run' ? Math.sin(curAnim) * 0.8 : (curState === 'jump' ? -0.4 : 0.25);
            hand = this.drawLimb(g, 0, hY + 12, Math.PI / 2 + aA, -0.8, 25, 25);
            g.lineStyle(3, 0x000000, overrideAlpha);
            g.beginPath(); g.moveTo(hand.x, hand.y);
            let swX = curState === 'idle' ? -15 : -40; let swY = curState === 'idle' ? 55 : 40;
            g.lineTo(hand.x + swX, hand.y + swY); g.strokePath();
        }
        g.restore();

        if (!isGhost) {
            const gY = this.getTerrainY(this.worldX + p.x);
            g.fillStyle(0x000000, 0.1); g.beginPath();
            // Replace ellipse with arc to fake it since ellipse drawing parameters slightly differ
            g.fillEllipse(p.x, gY + 2, 90, 18);

            g.lineStyle(4, 0x000000, 1);
            g.beginPath(); g.moveTo(p.scarfNodes[0].x, p.scarfNodes[0].y);
            for (let i = 1; i < p.scarfNodes.length; i++) g.lineTo(p.scarfNodes[i].x, p.scarfNodes[i].y);
            g.strokePath();

            if (p.isAttacking) {
                const maxF = p.attackType === 'heavy' ? 24 : (p.combo === 2 ? 22 : 14);
                const alpha = 1 - p.attackFrame / maxF;
                const isFinisher = (p.attackType === 'light' && p.combo === 2) || p.attackType === 'heavy';

                g.save();
                g.translateCanvas(p.x, p.y + (p.combo === 1 ? 60 : 45));
                g.scaleCanvas(p.dir, 1);

                g.lineStyle(isFinisher ? 65 : (p.combo === 1 ? 45 : 35), isFinisher ? 0xb40000 : 0x000000, alpha);
                g.beginPath();
                let sA, eA, radius = isFinisher ? 190 : 150;
                if (p.attackType === 'heavy') { sA = -1.8; eA = 1.2; }
                else if (p.combo === 0) { sA = -2.4; eA = 0.8; }
                else if (p.combo === 1) { sA = -0.6; eA = 0.6; radius = 170; }
                else { sA = -0.2; eA = 0.2; radius = 240; }
                g.arc(0, 0, radius, sA, eA, false);
                g.strokePath();
                g.restore();
            }
        }
    }

    customDraw() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Background and static terrain
        const bg = this.bgGraphics;
        bg.clear();

        // Apply screenshake
        if (this.screenShake > 0.1) {
            bg.setPosition((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
            this.drawGraphics.setPosition((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
        } else {
            bg.setPosition(0, 0);
            this.drawGraphics.setPosition(0, 0);
        }

        bg.fillStyle(0xe0e0e0, 1);
        for (let i = 0; i < 6; i++) {
            const x = ((i * 1800) - (this.worldX * 0.05)) % 3600;
            bg.beginPath(); bg.moveTo(x - 1000, this.baseGroundY);
            bg.lineTo(x, this.baseGroundY - 700); bg.lineTo(x + 1000, this.baseGroundY); bg.fillPath();
        }

        bg.fillStyle(0x222222, 1); bg.beginPath(); bg.moveTo(0, height);
        for (let x = 0; x <= width; x += 15) { bg.lineTo(x, this.getTerrainY(this.worldX + x)); }
        bg.lineTo(width, height); bg.fillPath();

        bg.lineStyle(4, 0x444444, 1); bg.beginPath(); bg.moveTo(0, this.getTerrainY(this.worldX));
        for (let x = 0; x <= width; x += 15) { bg.lineTo(x, this.getTerrainY(this.worldX + x)); }
        bg.strokePath();

        this.platforms.forEach(p => {
            const screenX = p.worldX - this.worldX;
            if (screenX + p.w < 0 || screenX > width) return;
            const y = this.getTerrainY(p.worldX) + p.yOffset;
            bg.fillStyle(0x222222, 1); bg.fillRect(screenX, y, p.w, p.h);
            bg.lineStyle(4, 0x000000, 1); bg.beginPath(); bg.moveTo(screenX, y); bg.lineTo(screenX + p.w, y); bg.strokePath();
        });

        this.obstacles.forEach(obs => {
            const screenX = obs.worldX - this.worldX;
            if (screenX + obs.w < 0 || screenX > width) return;
            const y = this.getTerrainY(obs.worldX);
            bg.fillStyle(0x000000, 1);
            bg.beginPath();
            for (let i = 0; i < 3; i++) {
                bg.moveTo(screenX + i * 20, y);
                bg.lineTo(screenX + 10 + i * 20, y - 40);
                bg.lineTo(screenX + 20 + i * 20, y);
            }
            bg.fillPath();
        });

        // Dynamic entities (DrawGraphics)
        const dg = this.drawGraphics;
        dg.clear();

        this.inkBlots.forEach(b => {
            const sX = b.worldX - this.worldX; if (sX < -100 || sX > width + 100) return;
            dg.save(); dg.translateCanvas(sX, b.y); dg.rotateCanvas(b.rot);
            dg.fillStyle(0x000000, b.life * 0.8); dg.fillEllipse(0, 0, b.size * 2, b.size * 0.8); dg.restore();
        });

        this.ghosts.forEach(g => { this.drawPlayer(dg, g.life * 0.5, true, g); });

        this.particles.forEach(p => {
            dg.fillStyle(p.color, p.life);
            dg.fillCircle(p.x, p.y, p.size);
        });

        this.enemies.forEach(e => {
            const sX = e.worldPos - this.worldX; if (sX < -200 || sX > width + 300) return;
            dg.save(); dg.translateCanvas(sX, e.y);
            dg.fillStyle(0x000000, 1);
            if (e.type === 'ghoul') {
                dg.fillEllipse(0, 10, 64, 32);
                dg.fillStyle(0xff0000, 1); dg.fillRect(-20, 0, 6, 6);
            } else if (e.type === 'oni') {
                dg.beginPath(); dg.moveTo(-50, 60); dg.lineTo(50, 60); dg.lineTo(40, -40); dg.lineTo(-40, -40); dg.closePath(); dg.fillPath();
                dg.fillStyle(0xffffff, 1); dg.fillCircle(-18, -12, 8); dg.fillCircle(18, -12, 8);
            } else {
                dg.fillRect(-22, -35, 44, 80); dg.fillStyle(0xff0000, 1); dg.fillCircle(0, -18, 7);
            }
            dg.fillStyle(0x000000, 0.1); dg.fillRect(-35, -e.radius - 35, 70, 7);
            dg.fillStyle(0xbb0000, 1); dg.fillRect(-35, -e.radius - 35, 70 * (e.hp / e.maxHp), 7);
            dg.restore();
        });

        this.drawPlayer(dg, 1, false, null);
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    transparent: true,
    // We don't actually need Physics Engine as we manually control everything for perfection
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [BootScene, GameScene]
};

window.addEventListener('resize', () => {
    if (game) game.scale.resize(window.innerWidth, window.innerHeight);
});

const game = new Phaser.Game(config);
