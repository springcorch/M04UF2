let canvas_w = 800;
let canvas_y = 450;

let config = {
    width: canvas_w,
    height: canvas_y,
    scene: {
        preload: precargar,
        create: crear,
        update: actualizar
    }
};

let juego = new Phaser.Game(config);

let huevera_b, huevera_m, huevera_d;
let huevoTipos = [];
let huevos = [];
let caida = 1;
let canvas_bg;
let minuto = 60;
let contador;
let H_scale = 0.5;
let HV_scale = 0.1;

let gameplay, gameover, grab, correct, incorrect;
let juegoTerminado = false;

function precargar() {
    this.load.image('fondo', 'graficos/cespedVerde.jpg');
    this.load.image('huevo_b', 'graficos/huevo_b.png');
    this.load.image('huevera', 'graficos/huevera.png');
    
    this.load.audio('gameplay', ['sounds/gameplay.wav']);
    this.load.audio('gameover', ['sounds/gameover.mp3']);
    this.load.audio('grabegg', ['sounds/grabegg.wav']);
    this.load.audio('correct', ['sounds/correct.wav']);
    this.load.audio('incorrect', ['sounds/incorrect.wav']);
}

function crear() {
    canvas_bg = this.add.image(canvas_w / 2, canvas_y / 2, 'fondo');
    huevera_b = this.add.image(100, 337, 'huevera').setScale(HV_scale);
    huevera_m = this.add.image(100, 225, 'huevera').setScale(HV_scale).setTint(Phaser.Display.Color.GetColor(192, 128, 16));
    huevera_d = this.add.image(100, 112, 'huevera').setScale(HV_scale).setTint(Phaser.Display.Color.GetColor(255, 154, 0));
    
    huevoTipos = [
        { key: 'huevo_b', tint: null, color: 'blanco', cesta: huevera_b },
        { key: 'huevo_b', tint: Phaser.Display.Color.GetColor(192, 128, 16), color: 'marron', cesta: huevera_m },
        { key: 'huevo_b', tint: Phaser.Display.Color.GetColor(255, 154, 0), color: 'dorado', cesta: huevera_d }
    ];
    
    gameplay = this.sound.add('gameplay', { loop: true, volume: 0.5 });
    gameover = this.sound.add('gameover', { loop: false, volume: 0.5 });
    grab = this.sound.add('grabegg');
    correct = this.sound.add('correct');
    incorrect = this.sound.add('incorrect');
    
    gameplay.play();
    contador = this.add.text(725, 15, minuto, { fontSize: '48px', fontStyle: 'bold' });
}

function actualizarTiempo() {
    if (juegoTerminado) return;
    minuto--;
    contador.setText(minuto);
    if (minuto <= 0) {
        finalizarJuego.call(this);
    }
}

function interaccionHuevos(huevo, tipo) {
    huevo.setInteractive({ draggable: true });
    huevo.on('pointerdown', function () {
        grab.play();
        this.setScale(0.7);
    });

    this.input.on('drag', function (pointer, object, x, y) {
        object.x = x;
        object.y = y;
    });

    this.input.on('dragend', function (pointer, object) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(tipo.cesta.getBounds(), object.getBounds())) {
            correct.play();
            object.destroy();
            huevos.splice(huevos.indexOf(object), 1);
        } else {
            incorrect.play();
            object.setScale(H_scale);
        }
    });
}

function spawnHuevo() {
    if (juegoTerminado) return;
    let huevoRand = Phaser.Utils.Array.GetRandom(huevoTipos);
    let x = Phaser.Math.Between(350, 650);
    let huevo = this.add.image(x, 0, huevoRand.key).setScale(H_scale);
    if (huevoRand.tint) huevo.setTint(huevoRand.tint);
    huevo.setInteractive({ draggable: true });
    huevos.push(huevo);
    interaccionHuevos.call(this, huevo, huevoRand);
}

function actualizar() {
    if (juegoTerminado) return;
    for (let i = huevos.length - 1; i >= 0; i--) {
        let huevo = huevos[i];
        huevo.y += caida;
        if (huevo.y > canvas_y) {
            huevo.destroy();
            huevos.splice(i, 1);
        }
    }
}

function finalizarJuego() {
    juegoTerminado = true;
    gameplay.stop();
    gameover.play();
    
    this.add.rectangle(canvas_w / 2, canvas_y / 2, 400, 200, 0x000000, 0.8);
    this.add.text(canvas_w / 2, canvas_y / 2 - 50, 'Game Over', { fontSize: '48px', fill: '#ffffff' }).setOrigin(0.5);
    this.add.text(canvas_w / 2, canvas_y / 2, `Puntuación: ${huevos.length}`, { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
    
    this.input.enabled = false;
}