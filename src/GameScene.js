import Phaser from 'phaser';
import { Player } from './Player.js';
import { EnemyManager } from './EnemyManager.js';
import { EffectManager } from './EffectManager.js';
import { UIManager } from './UIManager.js';

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

export class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    create() {
        this.gameState = {
            level: 1, hp: 100, maxHp: 100, atk: 45,
            currentStoryStep: 0, targetDistance: 15000,
            gameActive: true, isDialogueActive: false
        };

        this.worldX = 0;
        this.baseGroundY = this.scale.height * 0.82;
        
        this.bgGraphics = this.add.graphics().setScrollFactor(0);
        this.drawGraphics = this.add.graphics().setScrollFactor(0);

        this.ui = new UIManager(this);
        this.effectManager = new EffectManager(this);
        this.enemyManager = new EnemyManager(this, this.effectManager);
        
        this.player = new Player(
            this, 250, 
            (wX) => this.getTerrainY(wX), 
            this.effectManager
        );

        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            F: Phaser.Input.Keyboard.KeyCodes.F,
            R: Phaser.Input.Keyboard.KeyCodes.R,
            J: Phaser.Input.Keyboard.KeyCodes.J,
            K: Phaser.Input.Keyboard.KeyCodes.K,
            L: Phaser.Input.Keyboard.KeyCodes.L,
            SHIFT: Phaser.Input.Keyboard.KeyCodes.SHIFT,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
        
        // Virtual Input for Mobile/Touch
        this.virtualInput = { left: false, right: false, jump: false, attack: false, heavy: false, guard: false, dash: false };

        this.input.on('pointerdown', (pointer) => this.handlePointer(pointer, true));
        this.input.on('pointermove', (pointer) => this.handlePointer(pointer, true));
        this.input.on('pointerup', () => this.resetVirtualInput());
        
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.gameState.isDialogueActive) {
                this.gameState.isDialogueActive = false;
                this.ui.hideDialogue();
                this.gameState.gameActive = true;
            } else if (!this.gameState.gameActive && this.gameState.hp <= 0) {
                location.reload(); // Quick reset
            }
        });

        this.platforms = [];
        this.obstacles = [];
        this.lastMapX = 1200;
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

    checkStory() {
        const next = stories[this.gameState.currentStoryStep];
        if (next && this.worldX >= next.dist && this.gameState.gameActive) {
            this.gameState.isDialogueActive = true;
            this.ui.showDialogue(next.name, next.text);
            this.gameState.currentStoryStep++;
            this.gameState.gameActive = false;
        }
    }

    triggerGameOver() {
        this.gameState.gameActive = false;
        this.ui.showGameOver();
    }

    handlePointer(pointer, isDown) {
        if (!this.gameState.gameActive || this.gameState.isDialogueActive) return;
        this.resetVirtualInput();
        
        const { width, height } = this.scale;
        const x = pointer.x;
        const y = pointer.y;

        // Left Side: Movement
        if (x < width * 0.3) {
            if (x < width * 0.15) this.virtualInput.left = true;
            else this.virtualInput.right = true;
        } 
        // Right Side: Actions (Spread out)
        else if (x > width * 0.6) {
            if (y > height * 0.7) {
                if (x > width * 0.85) this.virtualInput.attack = true; // Far right
                else if (x > width * 0.72) this.virtualInput.heavy = true; // Middle right
                else this.virtualInput.guard = true; // Inner right
            } else {
                if (x > width * 0.8) this.virtualInput.jump = true;
                else this.virtualInput.dash = true;
            }
        }
    }

    resetVirtualInput() {
        for (let key in this.virtualInput) this.virtualInput[key] = false;
    }

    updateMap() {
        const width = this.scale.width;
        if (this.worldX + width + 1500 > this.lastMapX) {
            const x = this.lastMapX + 700 + Math.random() * 500;
            this.platforms.push({ worldX: x, yOffset: -200 - Math.random() * 250, w: 350 + Math.random() * 450, h: 25 });
            if (Math.random() < 0.5) this.obstacles.push({ worldX: x + 180, w: 60, h: 30 });
            this.lastMapX = x + 600;
        }
        this.platforms = this.platforms.filter(p => p.worldX - this.worldX > -width);
        this.obstacles = this.obstacles.filter(o => o.worldX - this.worldX > -width);
    }

    update() {
        if (this.gameState.isDialogueActive) return;

        if (this.gameState.gameActive) {
            this.player.update(this.keys);
            this.checkStory();
            this.updateMap();
        }

        this.enemyManager.update(this.worldX, (wX) => this.getTerrainY(wX), this.player, this.gameState);
        this.effectManager.update();
        this.ui.update(this.gameState, this.player);

        this.drawAll();
    }

    drawAll() {
        const bg = this.bgGraphics;
        bg.clear();

        const shake = this.effectManager.screenShake;
        if (shake > 0.1) {
            const sx = (Math.random() - 0.5) * shake;
            const sy = (Math.random() - 0.5) * shake;
            bg.setPosition(sx, sy);
            this.drawGraphics.setPosition(sx, sy);
        } else {
            bg.setPosition(0, 0);
            this.drawGraphics.setPosition(0, 0);
        }

        const width = this.scale.width;
        const height = this.scale.height;

        // Background Mountains
        bg.fillStyle(0xe0e0e0, 1);
        for (let i = 0; i < 6; i++) {
            const x = ((i * 1800) - (this.worldX * 0.05)) % 3600;
            bg.beginPath(); bg.moveTo(x - 1000, this.baseGroundY);
            bg.lineTo(x, this.baseGroundY - 700); bg.lineTo(x + 1000, this.baseGroundY); bg.fillPath();
        }

        // Terrain Base
        bg.fillStyle(0x222222, 1); bg.beginPath(); bg.moveTo(0, height);
        for (let x = 0; x <= width; x += 15) { bg.lineTo(x, this.getTerrainY(this.worldX + x)); }
        bg.lineTo(width, height); bg.fillPath();

        // Terrain Outline
        bg.lineStyle(4, 0x444444, 1); bg.beginPath(); bg.moveTo(0, this.getTerrainY(this.worldX));
        for (let x = 0; x <= width; x += 15) { bg.lineTo(x, this.getTerrainY(this.worldX + x)); }
        bg.strokePath();

        // Platforms & Obstacles
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

        // Dynamic Entities
        const dg = this.drawGraphics;
        dg.clear();

        this.effectManager.draw(dg, this.worldX);
        
        // Draw Ghosts
        this.effectManager.ghosts.forEach(g => { 
            this.player.draw(dg, g.life * 0.5, true, g); 
        });

        this.enemyManager.draw(dg, this.worldX);
        this.player.draw(dg, 1, false, null);
    }
}