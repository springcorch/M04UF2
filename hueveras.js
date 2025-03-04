let canvas_w = 800;
let canvas_y = 450;

let config = {
	width: canvas_w,
	height: canvas_y,
	scene: {
		preload: precarga,
		create: crea,
		update: actualiza
		}
	};

let game = new Phaser.Game(config);

let huevera_b, huevera_m, huevera_d;

//variables de huevo
let huevo_b, huevo_m, huevo_d;
let huevoTipos = [];
let huevos = [];
let caida = 1;

let canvas_bg;

let minuto = 60;
let contador;

let H_scale = .5;
let HV_scale = .1;

//variables de audio
let gameplay;
let gameover;
let grab;
let correct;
let incorrect;

function precarga () {
//imagenes
	this.load.image('fondo', 'graficos/cespedVerde.jpg');
	this.load.image('huevo_b', 'graficos/huevo_b.png');
	this.load.image('huevera', 'graficos/huevera.png');

//audios
	this.load.audio('gameplay',['sounds/gameplay.wav']);
	this.load.audio('gameover',['sounds/gameover.mp3']);
	this.load.audio('grabegg',['sounds/grabegg.wav']);
	this.load.audio('correct',['sounds/correct.wav']);
	this.load.audio('incorrect',['sounds/incorrect.wav']);
}

function crea () {
//fondo crear
	canvas_bg = this.add.image(canvas_w/2, canvas_y/2, 'fondo');

//hueveras crear
	huevera_b = this.add.image(100, 337, 'huevera');
	huevera_b.setScale(HV_scale);

	huevera_m = this.add.image(100, 225, 'huevera');
	huevera_m.setScale(HV_scale);
	huevera_m.setTint (Phaser.Display.Color.GetColor (192, 128, 16));
	
	huevera_d = this.add.image(100, 112, 'huevera');
	huevera_d.setScale(HV_scale);
	huevera_d.setTint (Phaser.Display.Color.GetColor (255, 154, 0));

//huevos crear
	huevo_b = this.add.image(-999, -999, 'huevo_b');
	huevoTipos.push({ huevo: huevo_b });

	huevo_m = this.add.image(-999, -999, 'huevo_b');
	huevoTipos.push({ huevo: huevo_m, tint: Phaser.Display.Color.GetColor(192,128,16)});

	huevo_d = this.add.image(-999, -999, 'huevo_b');
	huevoTipos.push({ huevo: huevo_d, tint: Phaser.Display.Color.GetColor(255,154,0)});
	
	interacionHuevos.call(this, huevo_b, 'blanco');
	interacionHuevos.call(this, huevo_m, 'marron');
	interacionHuevos.call(this, huevo_d, 'dorado');

//audios crear
	gameplay = this.sound.add('gameplay');
	gameplay.setLoop(true);
	gameplay.setVolume(0.5);
	gameover = this.sound.add('gameover');
	gameover.setLoop(true);
	gameover.setVolume(0.5);
	grab = this.sound.add('grabegg');
	correct = this.sound.add('correct');
	incorrect = this.sound.add('incorrect');

//play gameplay al inciar juego
	gameplay.play();

//contador crear
		contador = this.add.text(725, 15, minuto, {"fontSize": 48, "fontStyle": "bold"});

//Sistema de eventos
	this.time.addEvent({
		delay: 1000,
		callback: spawnHuevo,
		callbackScope: this,
		loop: true
	});
}

let interval_contador;
interval_contador = setInterval(function () {
	minuto--;
	contador.setText(minuto);
	if (minuto <= 0){
		console.log("Game Over");
		gameplay.pause();
		gameover.play();
		clearInterval(interval_contador);
		return;
	}
}, 1000);

//Interaccion huevos
function interacionHuevos(huevo, color) {
		huevo.on('pointerdown', function () {
		grab.play();
		console.log(`Clicado huevo de color ${color}`);
		this.setScale(.7);
		});

		this.input.on('drag', function (pointer, object, x, y) {
			object.x = x;
			object.y = y;
		});

		this.input.on('dragend', function (pointer, object, x, y){
			if (Phaser.Geom.Intersects.RectangleToRectangle(huevera_m.getBounds(), object.getBounds())) {
				console.log('huevo dentro huevera');
				correct.play();
			}
			else {
				incorrect.play();
			}
			object.setScale(H_scale); });
}

//Spawn huevos
function spawnHuevo(){
	let huevoRand = Phaser.Utils.Array.GetRandom(huevoTipos);
	let x = Phaser.Math.Between(350, 650);
	let huevo = this.add.image(x, 0, huevoRand.huevo.texture.key).setScale(H_scale);
	huevo.setTint(huevoRand.tint);
	huevo.setInteractive({ draggable: true })
	
	huevos.push(huevo);

	if(huevoRand.huevo === huevo_b){
		interacionHuevos.call(this, huevo, 'blanco');
	}else if(huevoRand.huevo === huevo_m){
		interacionHuevos.call(this, huevo, 'marron');
	}else if(huevoRand.huevo === huevo_d){
		interacionHuevos.call(this, huevo, 'dorado');
	}
}

function actualiza () {
	for(let i = huevos.length - 1; i >= 0; i--){
		let huevo = huevos[i];
		huevo.y += caida;
		if(huevo.y > canvas_y) {
			huevo.destroy();
			huevos.splice(i, 1);
		}
	}
}

