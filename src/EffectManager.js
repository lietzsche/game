export class EffectManager {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.inkBlots = [];
        this.ghosts = [];
        this.screenShake = 0;
    }

    addShake(amt) {
        this.screenShake = Math.max(this.screenShake, amt);
    }

    createParticles(x, y, color, count, speed) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * speed * 3,
                vy: (Math.random() - 0.5) * speed * 3,
                life: 1.0, color, size: Math.random() * 7 + 2
            });
        }
    }

    createInkBlot(worldX, y) {
        this.inkBlots.push({ worldX, y, size: Math.random() * 80 + 60, life: 1.0, rot: Math.random() * Math.PI * 2 });
    }

    createGhost(worldX, y, dir, state, animTimer, vy) {
        this.ghosts.push({ worldX, y, life: 0.6, dir, state, animTimer, vy });
    }

    update() {
        if (this.screenShake > 0) this.screenShake *= 0.82;

        for (let i = this.ghosts.length - 1; i >= 0; i--) {
            this.ghosts[i].life -= 0.12;
            if (this.ghosts[i].life <= 0) this.ghosts.splice(i, 1);
        }
        for (let i = this.inkBlots.length - 1; i >= 0; i--) {
            this.inkBlots[i].life -= 0.01;
            if (this.inkBlots[i].life <= 0) this.inkBlots.splice(i, 1);
        }
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx; p.y += p.vy; p.life -= 0.04;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    draw(g, worldX) {
        const width = this.scene.scale.width;
        
        this.inkBlots.forEach(b => {
            const sX = b.worldX - worldX;
            if (sX < -100 || sX > width + 100) return;
            g.save(); g.translateCanvas(sX, b.y); g.rotateCanvas(b.rot);
            g.fillStyle(0x000000, b.life * 0.8);
            g.fillEllipse(0, 0, b.size * 2, b.size * 0.8);
            g.restore();
        });

        this.particles.forEach(p => {
            g.fillStyle(p.color, p.life);
            g.fillCircle(p.x, p.y, p.size);
        });

        // Ghosts are drawn by Player class but iterated here or in MainScene
        // We'll expose ghosts array for Player to draw
    }
}