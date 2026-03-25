export class EnemyManager {
    constructor(scene, effectManager) {
        this.scene = scene;
        this.effects = effectManager;
        this.enemies = [];
    }

    spawn(worldX, width) {
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
            worldPos: worldX + width + 600,
            y: 0, yOff, attackCooldown: 0
        });
    }

    update(worldX, getTerrainY, player, gameState) {
        this.enemies.forEach(e => {
            if (e.knockback !== 0) { 
                e.worldPos += e.knockback; e.knockback *= 0.88; 
                if (Math.abs(e.knockback) < 0.5) e.knockback = 0; 
            } else { 
                e.worldPos -= e.speed; 
            }
            e.y = getTerrainY(e.worldPos) - e.yOff;
            
            const sX = e.worldPos - worldX;
            const dist = Math.abs(sX - player.x);
            
            if (dist < e.radius + 20 && Math.abs(e.y - (player.y + 60)) < 80) {
                if (player.invulFrame <= 0) {
                    let dmg = e.type === 'oni' ? 35 : 18;
                    // Check Parry Window (First 15 frames of guard)
                    if (player.isGuarding && player.guardFrame < 15) {
                        // Successful Parry
                        player.ink = Math.min(100, player.ink + 30);
                        this.effects.createParticles(player.x + player.dir * 35, player.y + 60, 0x00ffff, 15, 3);
                        this.effects.addShake(8);
                        e.knockback = 40; // Push enemy back
                        e.hp -= 20; // Minor damage from parry
                        this.scene.ui.showFeedback("PARRY!", player.x, player.y);
                        // Trigger parry freeze frames (optional: could just be visual)
                        player.invulFrame = 30;
                    } 
                    else if (player.isGuarding) { 
                        // Normal Guard
                        dmg *= 0.2; 
                        this.effects.createParticles(player.x + player.dir * 35, player.y + 60, 0xffbb00, 8, 2); 
                        this.effects.addShake(4); 
                        player.takeDamage(dmg);
                    } else { 
                        // Hit
                        e.knockback = 20; 
                        this.effects.addShake(20); 
                        player.takeDamage(dmg);
                    }
                }
            }
        });

        this.enemies = this.enemies.filter(e => e.hp > 0 && e.worldPos - worldX > -800);
        if (gameState.gameActive && Math.random() < 0.01 && this.enemies.length < 5) {
            this.spawn(worldX, this.scene.scale.width);
        }
    }

    draw(g, worldX) {
        const width = this.scene.scale.width;
        this.enemies.forEach(e => {
            const sX = e.worldPos - worldX; 
            if (sX < -200 || sX > width + 300) return;
            g.save(); g.translateCanvas(sX, e.y);
            g.fillStyle(0x000000, 1);
            if (e.type === 'ghoul') {
                g.fillEllipse(0, 10, 64, 32);
                g.fillStyle(0xff0000, 1); g.fillRect(-20, 0, 6, 6);
            } else if (e.type === 'oni') {
                g.beginPath(); g.moveTo(-50, 60); g.lineTo(50, 60); g.lineTo(40, -40); g.lineTo(-40, -40); g.closePath(); g.fillPath();
                g.fillStyle(0xffffff, 1); g.fillCircle(-18, -12, 8); g.fillCircle(18, -12, 8);
            } else {
                g.fillRect(-22, -35, 44, 80); g.fillStyle(0xff0000, 1); g.fillCircle(0, -18, 7);
            }
            g.fillStyle(0x000000, 0.1); g.fillRect(-35, -e.radius - 35, 70, 7);
            g.fillStyle(0xbb0000, 1); g.fillRect(-35, -e.radius - 35, 70 * (e.hp / e.maxHp), 7);
            g.restore();
        });
    }
}