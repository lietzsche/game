import Phaser from 'phaser';
import { GameScene } from './GameScene.js';

// Post-processing pipeline for Paper Texture effect
class PaperPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) {
        super({
            game,
            name: 'PaperPipeline',
            fragShader: `
                precision mediump float;
                uniform sampler2D uMainSampler;
                uniform vec2 uResolution;
                uniform float uTime;
                varying vec2 outTexCoord;

                float rand(vec2 n) { 
                    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
                }

                void main(void) {
                    vec4 color = texture2D(uMainSampler, outTexCoord);
                    
                    // Generate noise based on coordinate to simulate paper grain
                    float noise = rand(outTexCoord * uResolution) * 0.05;
                    
                    // Darken edges slightly (vignette)
                    vec2 uv = outTexCoord * 2.0 - 1.0;
                    float dist = length(uv);
                    float vignette = smoothstep(1.5, 0.5, dist);
                    
                    // Blend noise with paper base color if transparent
                    if(color.a == 0.0) {
                        gl_FragColor = vec4(vec3(0.86, 0.86, 0.86) - noise, 1.0) * vignette;
                    } else {
                        gl_FragColor = vec4(color.rgb - noise, color.a) * vignette;
                    }
                }
            `
        });
    }

    onPreRender() {
        this.set1f('uTime', this.game.loop.time);
        this.set2f('uResolution', this.game.config.width, this.game.config.height);
    }
}

class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    create() {
        // We can apply the pipeline globally to the camera
        this.scene.start('GameScene');
    }
}

const config = {
    type: Phaser.WEBGL, // WebGL required for shaders
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#dcdcdc',
    // Removed Arcade Physics for optimization
    scene: [BootScene, GameScene],
    pipeline: { 'PaperPipeline': PaperPipeline }
};

window.addEventListener('resize', () => {
    if (game) game.scale.resize(window.innerWidth, window.innerHeight);
});

const game = new Phaser.Game(config);

// Apply pipeline globally once game boots
game.events.on('ready', () => {
    game.scene.scenes.forEach(scene => {
        scene.cameras.main.setPostPipeline(PaperPipeline);
    });
});
