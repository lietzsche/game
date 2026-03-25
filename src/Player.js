export class Player {
    constructor(scene, x, getTerrainY, effects) {
        this.scene = scene;
        this.effects = effects;
        this.getTerrainY = getTerrainY;
        
        this.x = x;
        this.y = 0;
        this.width = 30;
        this.height = 120;
        this.vy = 0;
        this.jumpPower = -17.5;
        this.gravity = 0.62;
        this.isJumping = false;
        
        this.walkSpeed = 6.0;
        this.runSpeed = 17.0;
        this.speed = 6.0;
        
        this.isRunning = false;
        this.isGuarding = false;
        this.guardFrame = 0;
        
        this.dir = 1;
        this.state = 'idle';
        this.animTimer = 0;
        
        this.isAttacking = false;
        this.attackFrame = 0;
        this.attackType = null;
        this.combo = 0;
        this.comboTimer = 0;
        
        this.scarfNodes = [];
        this.invulFrame = 0;
        
        this.ink = 100;
        this.maxInk = 100;
        this.inkCostDash = 15;
        this.inkCostHeavy = 30;

        for (let i = 0; i < 15; i++) {
            this.scarfNodes.push({ x: this.x, y: this.y });
        }
    }

    takeDamage(amt) {
        this.scene.gameState.hp -= amt;
        this.effects.createParticles(this.x, this.y + 60, 0x000000, 25, 5);
        if (this.scene.gameState.hp <= 0) {
            this.scene.triggerGameOver();
        }
    }

    jump() {
        if (!this.isJumping && !this.isGuarding) {
            this.vy = this.jumpPower; 
            this.isJumping = true;
        }
    }

    attack(type) {
        if (this.isAttacking || this.isGuarding || !this.scene.gameState.gameActive) return;
        
        if (type === 'heavy') {
            if (this.ink < this.inkCostHeavy) return;
            this.ink -= this.inkCostHeavy;
        }

        this.isAttacking = true; 
        this.attackFrame = 0; 
        this.attackType = type;
        
        if (type === 'light') {
            if (this.comboTimer > 0) this.combo = (this.combo + 1) % 3;
            else this.combo = 0;
            this.comboTimer = 45;
        }
        
        const range = (type === 'heavy' || this.combo === 2) ? 260 : (this.combo === 1 ? 210 : 180);
        const damage = type === 'heavy' ? this.scene.gameState.atk * 4 : (this.combo === 2 ? this.scene.gameState.atk * 2.5 : this.scene.gameState.atk);

        this.scene.enemyManager.enemies.forEach(en => {
            const sEX = en.worldPos - this.scene.worldX;
            const dx = sEX - this.x;
            const isDir = (this.dir === 1 && dx > 0) || (this.dir === -1 && dx < 0);
            if (Math.abs(dx) < range && isDir && Math.abs(en.y - (this.y + 60)) < 220) {
                en.hp -= damage;
                en.knockback = this.dir * (type === 'heavy' || this.combo === 2 ? 55 : 25);
                this.effects.createParticles(sEX, en.y, 0x550000, 18, 6);
                if (en.hp <= 0) {
                    this.effects.createInkBlot(en.worldPos, this.getTerrainY(en.worldPos));
                    this.effects.createParticles(sEX, en.y, 0x000000, 60, 10);
                }
                this.effects.addShake(this.combo === 2 || type === 'heavy' ? 38 : 18);
            }
        });
    }

    update(keys) {
        if (!keys || !keys.S) return; // Guard against undefined keys
        const v = this.scene.virtualInput || {};
        const isGuardingKey = (keys.S && keys.S.isDown) || (keys.L && keys.L.isDown) || v.guard;
        const justGuarded = isGuardingKey && !this.isJumping;

        if (justGuarded && !this.isGuarding) {
            this.isGuarding = true;
            this.guardFrame = 0;
        } else if (justGuarded) {
            this.guardFrame++;
        } else {
            this.isGuarding = false;
            this.guardFrame = 0;
        }

        const isDashAttempt = (keys.SHIFT.isDown || v.dash) && !this.isGuarding;
        if (isDashAttempt && this.ink > 0) {
            this.isRunning = true;
            this.ink = Math.max(0, this.ink - 0.5);
        } else {
            this.isRunning = false;
        }

        if (!this.isGuarding && !this.isRunning) {
            this.ink = Math.min(this.maxInk, this.ink + 0.2);
        }

        this.speed = this.isRunning ? this.runSpeed : (this.isGuarding ? this.walkSpeed * 0.4 : this.walkSpeed);

        const animFreq = this.isRunning ? 0.04 : (this.isGuarding ? 0.01 : 0.02);
        this.animTimer += this.speed * animFreq;

        let isMoving = false;
        if (!this.isAttacking) {
            if (keys.D.isDown || v.right) { this.scene.worldX += this.speed; this.dir = 1; isMoving = true; }
            else if (keys.A.isDown || v.left) { if (this.scene.worldX > 0) this.scene.worldX -= this.speed; this.dir = -1; isMoving = true; }

            if (Phaser.Input.Keyboard.JustDown(keys.W) || Phaser.Input.Keyboard.JustDown(keys.SPACE) || v.jump) {
                this.jump();
                if(v.jump) v.jump = false; // Prevent multi-jump from touch
            }
            
            if (Phaser.Input.Keyboard.JustDown(keys.F) || Phaser.Input.Keyboard.JustDown(keys.J) || v.attack) {
                this.attack('light');
                if(v.attack) v.attack = false;
            }
            if (Phaser.Input.Keyboard.JustDown(keys.R) || Phaser.Input.Keyboard.JustDown(keys.K) || v.heavy) {
                this.attack('heavy');
                if(v.heavy) v.heavy = false;
            }
        }

        if (this.isAttacking) {
            if (this.attackFrame < 10) this.scene.worldX += (this.combo === 2 ? 15 : 5) * this.dir;
        } else if (this.isJumping) { this.state = 'jump'; }
        else if (this.isGuarding) { this.state = 'guard'; }
        else if (isMoving) { this.state = this.isRunning ? 'run' : 'walk'; }
        else { this.state = 'idle'; }

        this.vy += this.gravity;
        this.y += this.vy;
        
        const currentGroundY = this.getTerrainY(this.scene.worldX + this.x);
        if (this.y + this.height > currentGroundY) {
            if (this.isJumping) { 
                this.effects.createParticles(this.x, currentGroundY, 0xaaaaaa, 12, 1.5); 
                this.effects.addShake(6); 
            }
            this.y = currentGroundY - this.height; 
            this.vy = 0; 
            this.isJumping = false;
        }

        if (this.invulFrame > 0) this.invulFrame--;

        const scarfBaseX = this.x - (10 * this.dir); 
        const scarfBaseY = this.y + 25;
        this.scarfNodes[0] = { x: scarfBaseX, y: scarfBaseY };
        for (let i = 1; i < this.scarfNodes.length; i++) {
            const node = this.scarfNodes[i]; const prev = this.scarfNodes[i - 1];
            const lerp = this.state === 'run' ? 0.6 : 0.35;
            node.x += (prev.x - (this.dir * 4) - node.x) * lerp;
            node.y += (prev.y - node.y) * lerp + Math.sin(Date.now() * 0.02 + i) * 0.7;
        }

        if (this.isAttacking) {
            this.attackFrame++;
            const maxF = (this.attackType === 'heavy' || this.combo === 2) ? 26 : 16;
            if (this.attackFrame > maxF) { this.isAttacking = false; this.attackFrame = 0; }
        }
        if (this.comboTimer > 0) this.comboTimer--; else this.combo = 0;

        if ((this.state === 'run' || (this.isAttacking && this.combo === 2)) && Math.random() < 0.7) {
            this.effects.createGhost(this.scene.worldX + this.x, this.y, this.dir, this.state, this.animTimer, this.vy);
        }
    }

    drawLimb(g, x1, y1, angle1, angle2, l1, l2) {
        const x2 = x1 + Math.cos(angle1) * l1; const y2 = y1 + Math.sin(angle1) * l1;
        const x3 = x2 + Math.cos(angle1 + angle2) * l2; const y3 = y2 + Math.sin(angle1 + angle2) * l2;
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x3, y3); g.strokePath();
        return { x: x3, y: y3 };
    }

    draw(g, overrideAlpha, isGhost, ghostState) {
        const curState = isGhost ? ghostState.state : this.state;
        const curAnim = isGhost ? ghostState.animTimer : this.animTimer;
        const curDir = isGhost ? ghostState.dir : this.dir;
        const curVy = isGhost ? ghostState.vy : this.vy;

        if (!isGhost && this.invulFrame > 0 && Math.floor(Date.now() / 80) % 2 === 0) return;

        g.save();
        const bPX = isGhost ? ghostState.worldX - this.scene.worldX : this.x;
        const bPY = isGhost ? ghostState.y : this.y;

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

        // Dynamic Leaning during Attack
        let leanAngle = 0;
        if (this.isAttacking && !isGhost) {
            const prg = this.attackFrame / (this.attackType === 'heavy' ? 26 : 16);
            leanAngle = Math.sin(prg * Math.PI) * (this.attackType === 'heavy' ? 0.6 : 0.3);
            g.rotateCanvas(leanAngle); // Lean body into the attack
            
            if (this.combo === 0) pX = 15;
            else if (this.combo === 1) pX = -10;
            else pX = 25;
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
        if (!isGhost && this.isAttacking) {
            const maxF = this.attackType === 'heavy' ? 26 : (this.combo === 2 ? 22 : 16);
            const prg = this.attackFrame / maxF;
            
            // Non-linear easing for "snappy" swing
            const easePrg = Math.pow(prg, 0.5); 
            
            let sA, eA;
            if (this.attackType === 'heavy') { sA = -2.0; eA = 1.5; }
            else if (this.combo === 0) { sA = -2.5; eA = 1.0; }
            else if (this.combo === 1) { sA = 1.2; eA = -1.2; } // Vertical down
            else { sA = -0.5; eA = 1.8; }

            const swing = sA + (eA - sA) * easePrg;
            const elbowA = (this.combo === 1) ? 1.2 : 0.4;
            hand = this.drawLimb(g, 0, hY + 12, swing, elbowA, 35, 35);

            // Blade with motion trail weight
            g.lineStyle(8, 0x000000, overrideAlpha);
            g.beginPath(); g.moveTo(hand.x, hand.y);
            let bladeLen = (this.combo === 2 || this.attackType === 'heavy') ? 140 : 110;
            g.lineTo(hand.x + Math.cos(swing) * bladeLen, hand.y + Math.sin(swing) * bladeLen);
            g.strokePath();
            
            // Add "Speed Lines" around hand
            if (prg > 0.2 && prg < 0.8) {
                g.lineStyle(2, 0x000000, 0.3);
                for(let i=0; i<3; i++) {
                    let ang = swing - 0.2 + (i*0.1);
                    g.beginPath(); 
                    g.moveTo(hand.x + Math.cos(ang)*40, hand.y + Math.sin(ang)*40);
                    g.lineTo(hand.x + Math.cos(ang)*100, hand.y + Math.sin(ang)*100);
                    g.strokePath();
                }
            }
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
            const gY = this.getTerrainY(this.scene.worldX + this.x);
            g.fillStyle(0x000000, 0.1); g.beginPath();
            g.fillEllipse(this.x, gY + 2, 90, 18);

            g.lineStyle(4, 0x000000, 1);
            g.beginPath(); g.moveTo(this.scarfNodes[0].x, this.scarfNodes[0].y);
            for (let i = 1; i < this.scarfNodes.length; i++) g.lineTo(this.scarfNodes[i].x, this.scarfNodes[i].y);
            g.strokePath();

            // --- ADVANCED SLASH TRAIL (Brush Stroke) ---
            if (this.isAttacking) {
                const maxF = this.attackType === 'heavy' ? 26 : (this.combo === 2 ? 22 : 16);
                const prg = this.attackFrame / maxF;
                const alpha = Math.pow(1 - prg, 1.5);
                const isFinisher = (this.attackType === 'light' && this.combo === 2) || this.attackType === 'heavy';

                g.save();
                g.translateCanvas(this.x, this.y + (this.combo === 1 ? 40 : 55));
                g.scaleCanvas(this.dir, 1);

                let sA, eA, radius = isFinisher ? 210 : 160;
                if (this.attackType === 'heavy') { sA = -2.0; eA = 1.5; }
                else if (this.combo === 0) { sA = -2.5; eA = 1.0; }
                else if (this.combo === 1) { sA = -1.5; eA = 1.5; radius = 180; g.rotateCanvas(Math.PI/2); } // Vertical
                else { sA = -0.8; eA = 2.0; radius = 220; }

                // Multi-layered brush stroke for "Ink" look
                for(let i=0; i<3; i++) {
                    const offset = i * 4;
                    const trailAlpha = alpha * (1 - i * 0.3);
                    g.lineStyle(isFinisher ? 70 - offset : 40 - offset, isFinisher ? 0xb40000 : 0x000000, trailAlpha);
                    g.beginPath();
                    // Draw a shorter arc as the "head" of the slash
                    const headPrg = Math.min(1, prg * 1.4);
                    const curEA = sA + (eA - sA) * headPrg;
                    g.arc(0, 0, radius - (i*2), sA, curEA, false);
                    g.strokePath();
                }

                // Ink Splatter at the tip of the slash
                if (Math.random() < 0.4) {
                    const tipA = sA + (eA - sA) * prg;
                    this.effects.createParticles(
                        this.x + Math.cos(tipA) * radius * this.dir, 
                        this.y + 55 + Math.sin(tipA) * radius, 
                        isFinisher ? 0xb40000 : 0x000000, 3, 2
                    );
                }
                g.restore();
            }
        }
    }
}