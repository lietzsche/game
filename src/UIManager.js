export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.width = scene.scale.width;
        this.height = scene.scale.height;

        this.graphics = scene.add.graphics();
        this.graphics.setScrollFactor(0);
        this.graphics.setDepth(100);

        this.touchGraphics = scene.add.graphics();
        this.touchGraphics.setScrollFactor(0);
        this.touchGraphics.setDepth(90);

        this.levelText = scene.add.text(30, 30, '墨影 LV.1', { font: 'italic bold 32px "Noto Serif KR"', fill: '#000' }).setScrollFactor(0).setDepth(100);
        this.progressText = scene.add.text(30, 85, 'Progress: 0%', { font: 'bold 12px "Noto Serif KR"', fill: '#666' }).setScrollFactor(0).setDepth(100);
        this.controlsText = scene.add.text(30, 105, 'WASD: Move | S/L: Guard(Parry) | SHIFT: Dash | F/J: Attack | R/K: Heavy', { font: 'bold 10px "Noto Serif KR"', fill: '#888' }).setScrollFactor(0).setDepth(100);
        
        this.dialogueGroup = scene.add.group();
        this.dialogueBg = scene.add.rectangle(this.width / 2, this.height - 80, Math.min(700, this.width * 0.85), 100, 0xffffff, 0.95).setScrollFactor(0).setDepth(101).setOrigin(0.5);
        this.dialogueBg.setStrokeStyle(4, 0x000000);
        this.dialogueName = scene.add.text(this.dialogueBg.x - this.dialogueBg.width/2 + 20, this.dialogueBg.y - 35, '', { font: 'bold 20px "Noto Serif KR"', fill: '#000' }).setScrollFactor(0).setDepth(102);
        this.dialogueText = scene.add.text(this.dialogueBg.x - this.dialogueBg.width/2 + 20, this.dialogueBg.y - 5, '', { font: '18px "Noto Serif KR"', fill: '#333' }).setScrollFactor(0).setDepth(102);
        this.dialoguePrompt = scene.add.text(this.dialogueBg.x + this.dialogueBg.width/2 - 20, this.dialogueBg.y + 30, 'Press SPACE', { font: 'bold 12px Arial', fill: '#888' }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(102);
        
        this.dialogueGroup.addMultiple([this.dialogueBg, this.dialogueName, this.dialogueText, this.dialoguePrompt]);
        this.dialogueGroup.setVisible(false);

        // Game Over Box
        this.gameOverGroup = scene.add.group();
        this.gameOverBg = scene.add.rectangle(this.width/2, this.height/2, 400, 250, 0xffffff, 1).setScrollFactor(0).setDepth(200);
        this.gameOverBg.setStrokeStyle(6, 0x000000);
        this.gameOverTitle = scene.add.text(this.width/2, this.height/2 - 50, '윤회(輪廻)', { font: 'italic bold 48px "Noto Serif KR"', fill: '#000' }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
        this.gameOverDesc = scene.add.text(this.width/2, this.height/2 + 20, '붓끝의 선이 끊겼으나, 도는 끊이지 않습니다.', { font: 'italic 16px "Noto Serif KR"', fill: '#666' }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
        this.gameOverPrompt = scene.add.text(this.width/2, this.height/2 + 80, 'Press SPACE to Resurrect', { font: 'bold 14px Arial', fill: '#000' }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
        this.gameOverGroup.addMultiple([this.gameOverBg, this.gameOverTitle, this.gameOverDesc, this.gameOverPrompt]);
        this.gameOverGroup.setVisible(false);

        this.feedbacks = [];
    }

    showDialogue(name, text) {
        this.dialogueGroup.setVisible(true);
        this.dialogueName.setText(name);
        this.dialogueText.setText(text);
    }

    hideDialogue() {
        this.dialogueGroup.setVisible(false);
    }

    showGameOver() {
        this.gameOverGroup.setVisible(true);
    }

    showFeedback(text, x, y) {
        const fb = this.scene.add.text(x, y - 50, text, { font: 'bold 24px Arial', fill: '#ff0000', stroke: '#fff', strokeThickness: 4 }).setOrigin(0.5).setDepth(150);
        this.scene.tweens.add({
            targets: fb,
            y: y - 100,
            alpha: 0,
            duration: 800,
            onComplete: () => fb.destroy()
        });
    }

    update(gameState, player) {
        this.graphics.clear();
        
        // HP Bar
        this.graphics.lineStyle(2, 0x000000, 1);
        this.graphics.strokeRect(30, 65, 250, 16);
        this.graphics.fillStyle(0x000000, 1);
        const hpRatio = Math.max(0, gameState.hp / gameState.maxHp);
        this.graphics.fillRect(32, 67, 246 * hpRatio, 12);

        // Ink Bar
        this.graphics.lineStyle(2, 0x000000, 1);
        this.graphics.strokeRect(30, 45, 200, 12);
        this.graphics.fillStyle(0x333333, 1);
        const inkRatio = Math.max(0, player.ink / player.maxInk);
        this.graphics.fillRect(32, 47, 196 * inkRatio, 8);

        const prog = Math.min(100, Math.floor((this.scene.worldX / gameState.targetDistance) * 100));
        this.progressText.setText(`Progress: ${prog}%`);

        if (player.isGuarding) {
            if (player.guardFrame < 15) {
                this.graphics.fillStyle(0x00ffff, 0.8); // Parry window indicator
                this.graphics.fillCircle(player.x, player.y - 20, 10);
            } else {
                this.graphics.fillStyle(0xff0000, 0.8);
                this.graphics.fillCircle(player.x, player.y - 20, 10);
            }
        }

        // Draw Virtual Buttons (Subtle Ink Blots)
        this.drawVirtualButtons();
    }

    drawVirtualButtons() {
        const tg = this.touchGraphics;
        tg.clear();
        tg.fillStyle(0x000000, 0.05);
        
        const w = this.width;
        const h = this.height;

        // Left Side (Move)
        tg.fillCircle(w * 0.07, h * 0.85, 40); // Left
        tg.fillCircle(w * 0.22, h * 0.85, 40); // Right

        // Right Side (Actions)
        tg.fillCircle(w * 0.68, h * 0.85, 35); // Guard
        tg.fillCircle(w * 0.78, h * 0.85, 35); // Heavy
        tg.fillCircle(w * 0.92, h * 0.85, 45); // Attack (Largest)
        
        tg.fillCircle(w * 0.75, h * 0.65, 35); // Dash
        tg.fillCircle(w * 0.88, h * 0.65, 40); // Jump
    }
}