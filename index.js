
/* -------------------- Variáveis globais------------------------- */

var canvas, ctx;
var dificuldade;
var fim = false;                                            //determina o fim do jogo

/* ------------------------ Objetos ------------------------------ */

function ObjArqueiro(x, y, width, height, disparoHeight){
    this.x = x;                                             //posição x
    this.y = y;                                             //posição y
    this.width = width;                                     //largura
    this.height = height;                                   //altura
    this.disparoHeight = disparoHeight;                     //altura do disparo da flecha
    this.velX = 0;                                          //velocidade x
    this.velY = 0;                                          //velocidade y
    this.novaPos = function(){
        //calcula a nova posição (x,y)
        this.x += this.velX;
        this.y += this.velY;
    };
    this.movimento = function(v){
        //movimenta o arqueiro com velocidade v
        //utilizando setas do teclado
        this.velX = 0;
        this.velY = 0;
        if (teclas.keys && teclas.keys[37] && !fim)         //direita
            this.velX = -v;
        if (teclas.keys && teclas.keys[39] && !fim)         //esquerda
            this.velX = v;
        if (teclas.keys && teclas.keys[38] && !fim)         //cima
            this.velY = -v;
        if (teclas.keys && teclas.keys[40] && !fim)         //baixo
            this.velY = v;
        this.novaPos();
    };
    this.colideCanvas = function(){
        //detecta colisão do arqueiro com canvas
        if (this.x <= 0)
            this.x = 0;
        if (this.y <= 0)
            this.y = 0;
        if ((this.y + this.height) >= canvas.height)
            this.y = canvas.height - this.height;
    }
}

function ObjFlecha(x, y, width, height){
    this.x = x;                                             //posição inicial da flecha
    this.y = y;                                             //(arco do arqueiro)
    this.width = width;                                     //largura
    this.height = height;                                   //altura
    this.velX = 0;                                          //velocidade x
    this.colisaoDragao = false;
    this.dispara = function(disparoX, disparoY){
        //dispara flecha a partir
        //da posição (x,y) do arqueiro
        this.x = disparoX;
        this.y = disparoY;
    };
    this.novaPos = function(){
        //calcula a nova posição x
        this.x += this.velX;
    };
    this.movimento = function(v){
        //movimenta a flecha com velocidade v
        this.velX = v;
        this.novaPos();
    };
    this.colideCanvas = function(disparoX, disparoY){
        //na colisão da flecha com canvas
        //dispara novamente
        if (this.x >= canvas.width){
            this.dispara(disparoX, disparoY);
        }
    }
}

function ObjDragao(x, y, width, height, disparoHeight){
    this.x = x;                                             //posição x
    this.y = y;                                             //posição y
    this.width = width;                                     //largura
    this.height = height;                                   //altura
    this.disparoHeight = disparoHeight;                     //altura do disparo da bola de fogo
    this.velY = 0;                                          //velocidade y
    this.novaPos = function(){
        //calcula a nova posição y
        this.y += this.velY;
    };
    this.movimento = function(v, aX, aY, aYH){
        /* movimenta o dragão com velocidade v caso
           arqueiro não esteja na borda do canvas */
        this.velY = 0;

        //aX = arqueiro.x
        //aY = arqueiro.y
        //aYH = arqueiro.y + arqueiro.height
        if ((aY > 0)
            && (aYH < canvas.height)
        ){
            if (teclas.keys && teclas.keys[38])
                this.velY = -v;
            if (teclas.keys && teclas.keys[40])
                this.velY = v;
        }

        this.novaPos();
    }
}

function ObjBolaFogo(x, y, width, height){
    this.x = x;                                             //posição inicial da bolaFogo
    this.y = y;                                             //(boca do dragão)
    this.width = width;                                     //largura
    this.height = height;                                   //altura
    this.velX = 0;                                          //velocidade x
    this.velY = 0;                                          //velocidade y
    this.novaPos = function(){
        //calcula a nova posição (x, y)
        this.x += this.velX;
        this.y += this.velY;
    };
    this.aim = function(a, dX){
        //mira bola de fogo no centro do arqueiro

        //a = arqueiro.y + (arqueiro.height/2)
        //dX = dragao.x
        var c = canvas.height / 8;

        /* divide o canvas em 8 partes
           e muda a velocidade Y da bola de fogo
           de acordo com a posição do arqueiro */

        if ((a >= 0) && (a <= c) && (this.x === dX)){
            this.velY = -3.0;
        }
        if ((a >= c) && (a <= 2*c)&& (this.x === dX)){
            this.velY = -2.5;
        }
        if ((a >= 2*c) && (a <= 3*c)&& (this.x === dX)){
            this.velY = -1.0;
        }
        if ((a >= 3*c) && (a <= 4*c)&& (this.x === dX)){
            this.velY = 0;
        }
        if ((a >= 4*c) && (a <= 5*c)&& (this.x === dX)){
            this.velY = 0;
        }
        if ((a >= 5*c) && (a <= 6*c)&& (this.x === dX)){
            this.velY = 1.0;
        }
        if ((a >= 6*c) && (a <= 7*c)&& (this.x === dX)){
            this.velY = 2.5;
        }
        if ((a >= 7*c) && (a <= 8*c)&& (this.x === dX)){
            this.velY = 3.0;
        }
    };
    this.movimento = function(v, a, dX){
        //movimenta bola de fogo
        this.velX = -v;

        this.aim(a, dX);

        this.novaPos();
    };
    this.dispara = function(disparoX, disparoY){
        this.x = disparoX;
        this.y = disparoY;
    };
    this.colideCanvas = function(disparoX, disparoY){
        //na colisão da bola fogo com canvas
        //dispara novamente
        if (this.x + this.width <= 0){
            this.dispara(disparoX, disparoY);
        }
        if (this.y + this.height <= 0){
            this.dispara(disparoX, disparoY);
        }
        if (this.y >= canvas.height){
            this.dispara(disparoX, disparoY);
        }
    }
}

function ObjScore(a, b, c, d, vidaArqueiro, vidaDragao){
    /*armazena e calcula o HP dos personagens
      dano bolaFogo varia entre a e b
      dano flecha varia entre c e d */
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.vidaArqueiro = vidaArqueiro;                       //determina vida do arqueiro
    this.vidaDragao = vidaDragao;                           //determina vida do dragao
    this.danoBolaFogo = random(this.a, this.b);
    this.danoFlecha = random(this.c, this.d);
    this.morto = false;
    this.diminuiVidaArqueiro = function(){
        //reduz a vida do arqueiro
        this.vidaArqueiro = this.vidaArqueiro - this.danoBolaFogo;
    };
    this.diminuiVidaDragao = function(){
        //reduz a vida do dragão
        this.vidaDragao = this.vidaDragao - this.danoFlecha;
    };
    this.danoAleatorio = function() {
        //calcula novamente um dano aleatório
        this.danoBolaFogo = random(this.a, this.b);
        this.danoFlecha = random(this.c, this.d);
    }
}

var teclas = {
    /* objeto armazena o vetor[] teclas pressionadas
    criado com método teclas.keys, na função verificaTeclado()*/
};

var desenha = {
    //fundo do jogo
    background: function (yHorizonte){
        //desenha céu
        var sky = new Image();
        sky.src = 'img/sky.png';
        ctx.drawImage(sky, 0, 0, canvas.width, yHorizonte);

        //desenha grama a partir de textura 64x64 pixels
        var grass = new Image();
        grass.src = 'img/grass.png';

        for (var i=0; i < 15; i++) {
            for (var k=0; k < 9; k++){
                ctx.drawImage(grass, i*64, yHorizonte+(k*64), 64, 64);
            }
        }
    },

    //personagens e objetos
    arqueiro: function(){
        var imagemArqueiro = new Image();
        imagemArqueiro.src = 'img/arqueiro.png';
        ctx.drawImage(imagemArqueiro, arqueiro.x, arqueiro.y, arqueiro.width, arqueiro.height);
    },
    arqueiroQueimado: function (){
        //desenha arqueiro queimado pelo fogo do dragão
        var imagemArqueiro = new Image();
        imagemArqueiro.src = 'img/arqueiro_queimado.png';
        ctx.drawImage(imagemArqueiro, arqueiro.x, arqueiro.y, arqueiro.width, arqueiro.height);
    },
    arqueiroMorto: function (yHorizonte){
        //desenha arqueiro morto sem braço
        desenha.background(yHorizonte);
        desenha.dragao();
        desenha.score();
        var imagemArqueiro = new Image();
        imagemArqueiro.src = 'img/arqueiro_morto.png';
        ctx.drawImage(imagemArqueiro, arqueiro.x, arqueiro.y, arqueiro.width, arqueiro.height);
    },
    flecha: function (){
        var imagemFlecha = new Image();
        imagemFlecha.src = 'img/flecha.png';
        ctx.drawImage(imagemFlecha, flecha.x, flecha.y, flecha.width, flecha.height);
    },
    dragao: function(){
        var imagemDragao = new Image();
        imagemDragao.src = 'img/dragao.png';
        ctx.drawImage(imagemDragao, dragao.x, dragao.y, dragao.width, dragao.height);
    },
    dragaoMorto: function(){
        var imagemDragao = new Image();
        imagemDragao.src = 'img/dragao_morto.png';
        ctx.drawImage(imagemDragao, dragao.x, dragao.y, dragao.width, dragao.height);
    },
    bolaFogo: function (i){
        //desenha a bola de fogo i
        var imagemBolaFogo = new Image();
        imagemBolaFogo.src = 'img/fireball.png';
        if (i === 0 ){
            ctx.drawImage(imagemBolaFogo, bolaFogo[i].x, bolaFogo[i].y, bolaFogo[i].width, bolaFogo[i].height);
        }
        else if (i === 1 ){
            ctx.drawImage(imagemBolaFogo, bolaFogo[i].x, bolaFogo[i].y, bolaFogo[i].width, bolaFogo[i].height);
        }
        else if (i === 2 ){
            ctx.drawImage(imagemBolaFogo, bolaFogo[i].x, bolaFogo[i].y, bolaFogo[i].width, bolaFogo[i].height);
        }
        else if (i === 3 ){
            ctx.drawImage(imagemBolaFogo, bolaFogo[i].x, bolaFogo[i].y, bolaFogo[i].width, bolaFogo[i].height);
        }
    },

    //texto
    texto: function(cor, fonte, texto, x, y){
        ctx.fillStyle = cor;
        ctx.font = fonte;
        ctx.fillText(texto, x, y);
    },
    score: function(){
        //desenha vida dos personagens
        var zero = 0;
        if (score.vidaDragao >= 0)
            desenha.texto("red", "28px Arial Black", score.vidaDragao.toString(), 640, 20);
        else
            desenha.texto("red", "28px Arial Black", zero.toString(), 640, 20);

        if (score.vidaArqueiro >= 0)
            desenha.texto("red", "28px Arial Black", score.vidaArqueiro.toString(), 260, 20);
        else
            desenha.texto("red", "28px Arial Black", zero.toString(), 260, 20);


    }
};

/* ------------------------- Main -------------------------------- */

//instancia objetos
var arqueiro = new ObjArqueiro(100, 250, 116, 154, 61);
var flecha = new ObjFlecha(arqueiro.x + arqueiro.width, arqueiro.y + arqueiro.disparoHeight, 80, 20);
var dragao = new ObjDragao(620, 183, 300, 314, 102);

//declara 4 objetos bola de fogo
var bolaFogo = new Array(4);
for (var i=0; i < 4; i++){
    bolaFogo[i] = new ObjBolaFogo(dragao.x, dragao.y + dragao.disparoHeight, 190, 110);
}

/* declara objeto score */
var score = new ObjScore(4, 6, 5, 7, 100, 8000);

/* ------------------------ Funçoes ------------------------------ */

var frame = 0;                                          //contador de quadros
function update(){
    // loop principal do jogo
    requestAnimationFrame(update);                      //atualiza canvas
    frame += 1;                                         //aumenta contador de frames

    /* A cada 30 frames, o arqueiro dispara uma flecha
       e um dano aleatório é atribuido para bolaFogo e flecha */
    if (frame > 30 && !fim){
        //reseta contador de frame
        frame = 1;
        //determina dano aleatório
        score.danoAleatorio();
        //dispara flecha
        flecha.dispara(arqueiro.x + arqueiro.width, arqueiro.y + arqueiro.disparoHeight);
    }

    /* ---------- background ----------- */
    desenha.background(140);                            //desenha background com horizonte em y=140

    /* ----------- arqueiro ------------ */
    desenha.arqueiro();                                 //desenha arqueiro
    arqueiro.colideCanvas();                            //verifica colisão com canvas

    /* ------------ flecha ------------- */
    /* se a flecha não está colidindo com dragão
       e não passou pelo dragão, desenha a flecha */
    if ((flecha.colisaoDragao !== true) && (flecha.x <= dragao.x+dragao.width) ) {
        desenha.flecha();
    }
    flecha.movimento(20);                               //movimenta flecha com velocidade 20

    /* ------------ dragao ------------- */
    desenha.dragao();                                   //desenha o dragão
    /* movimenta o dragão em y, com velocidade 5,
       de acordo com o movimento do arqueiro */
    dragao.movimento(0.5, arqueiro.x, arqueiro.y, arqueiro.y + arqueiro.height);

    /* ----------- arqueiro e bolaFogo ------------ */
    /* Movimenta o arqueiro, de acordo com o nível de dificuldade
       Desenha bolas de fogo, de acordo com o nível de dificuldade
       Se a vida do dragão diminuir, dispara mais bolas de fogo mirando
       na posição do jogado.
       Parãmtros são: velocidade max das bolas de fogo e diff entre elas. */
    if (dificuldade === "hard"){
        arqueiro.movimento(7);
        updateBolaFogo(10, 2);
    }
    else{
        arqueiro.movimento(5);
        updateBolaFogo(5, 1);
    }

    /* --- colisões entre 2 objetos ---- */
    flechaDragao();                                     //quando flecha atinge dragão
    bolaFogoArqueiro();                                 //quando bola fogo atinge o arqueiro

    /* ------------ score -------------- */
    desenha.score();                                    //desenha as vidas dos personagens

    /* ---------- Game Over ------------ */
    gameOver();                                         //game over
}

function iniciaJogo(){
    var nivelDific = document.getElementById("selecionar");
    /* Determina o nível de dificuldade
    Exemplo nível normal:
    dano da bolaFogo varia entra a=4 e b=6,
    dano da flecha varia entre c=5 e d=7 */
    if (nivelDific.value === "easy"){                   //nível fácil de dificuldade
        dificuldade = "easy";
        //bolaFogo
        score.a = 2;
        score.b = 3;
        //flecha
        score.c = 9;
        score.d = 11;
    }
    else if (nivelDific.value === "normal"){              //nível normal de dificuldade
        dificuldade = "normal";
        //bolaFogo
        score.a = 4;
        score.b = 6;
        //flecha
        score.c = 5;
        score.d = 7;
    }
    else if (nivelDific.value === "hard"){              //nível alto de dificuldade
        dificuldade = "hard";
        //bolaFogo
        score.a = 4;
        score.b = 5;
        //flecha
        score.c = 9;
        score.d = 11;
    }

    //cria canvas com tamanho w x h pixels
    criaCanvas(960, 680);

    //desabilita elementos
    var btn = document.getElementById("botao");
    btn.disabled = true;
    var s = document.getElementById("selecionar");
    s.disabled = true;
    var opcoes = document.getElementById("opcoes");
    opcoes.style.display = "none";

    //cria evento leitura do teclado
    verificaTeclado();

    //loop update
    update()
}

function criaCanvas(w, h){
    canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    ctx = canvas.getContext("2d");

    //coloca canvas no div jogo
    var divJogo = document.getElementById("jogo");
    divJogo.appendChild(canvas);
}

function verificaTeclado(){
    //verifica pressionamento das teclas
    window.addEventListener('keydown', function a(e){
        teclas.keys = (teclas.keys || []);                  //cria o vetor teclas pressionadas
        teclas.keys[e.keyCode] = (e.type === "keydown");    //armazena a tecla pressionada no vetor

        // desabilita scroll da página
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }

        //se fim de jogo for true, para de verificar teclas
        if (fim){
            window.removeEventListener("keydown", a);
            teclas = [];
            teclas.keys[e.keyCode] = 0;
        }
    });
    window.addEventListener('keyup', function b(e){
        teclas.keys[e.keyCode] = (e.type === "keydown");    //armazena a tecla pressionada

        if (fim){                                           //se fim de jogo for true, para de verificar teclas
            window.removeEventListener("keyup", b);
            teclas = [];
            teclas.keys[e.keyCode] = 0;
        }
    });
}

function bfogo (i, velMax, diff){
    //funçoes da bola de fogo i
    desenha.bolaFogo(i);
    bolaFogo[i].movimento(velMax - i*diff, arqueiro.y + (arqueiro.height/2), dragao.x);
    bolaFogo[i].colideCanvas(dragao.x, dragao.y + dragao.disparoHeight);
}

function updateBolaFogo(velMax, diff){
    /* se a vida do dragão diminuir, adiciona mais bolas de fogo
       velMax é a velocidade da bola 0, vMax=n*vDiff é a velocidade
       das outras bolas */
    if ((score.vidaDragao <= 8000) && (score.vidaDragao > 7000)){
        //uma bola de fogo
        bfogo (0, velMax, diff);
    }
    else if ((score.vidaDragao <= 7000) && (score.vidaDragao > 6000)){
        //duas bolas de fogo
        bfogo (0, velMax, diff);
        bfogo (1, velMax, diff);
    }
    else if ((score.vidaDragao <= 6000) && (score.vidaDragao > 2000)){
        //tres bolas de fogo
        bfogo (0, velMax, diff);
        bfogo (1, velMax, diff);
        bfogo (2, velMax, diff);
    }
    else if ((score.vidaDragao <= 2000 && score.vidaDragao >= 0)){
        //quatro bolas de fogo
        bfogo (0, velMax, diff);
        bfogo (1, velMax, diff);
        bfogo (2, velMax, diff);
        bfogo (3, velMax, diff);
    }
}

//colisões entre 2 objetos

function flechaDragao(){
    // detecta colisão da flecha com dragao
    var rect1 = {x: flecha.x, y: flecha.y, width: flecha.width, height: flecha.height};
    var rect2 = {x: dragao.x, y: dragao.y, width: dragao.width, height: dragao.height};

    if (rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y)
    {
        //colisão detectada
        flecha.colisaoDragao = true;

        //diminui a vida do dragão
        score.diminuiVidaDragao();
    }
    else
        flecha.colisaoDragao = false;
}

function bolaFogoArqueiro(){
    // detecta colisão das bolas de fogo com arqueiro
    var rect1 = {x: arqueiro.x, y: arqueiro.y, width: arqueiro.width, height: arqueiro.height};

    for (var i=0; i < 4; i++){
        var rect2 = {x: bolaFogo[i].x, y: bolaFogo[i].y, width: bolaFogo[i].width, height: bolaFogo[i].height};

        if (rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.height + rect1.y > rect2.y)
        {
            //colisão detectada
            //dispara bola de fogo novamente
            bolaFogo[i].dispara(dragao.x, dragao.y + dragao.disparoHeight);

            //diminui vida do arqueiro
            score.diminuiVidaArqueiro();
        }
    }
}

//fim

function finalizaJogo(){
    //fim de jogo
    fim = true;

    //para de atirar bola de fogo
    for (var i=0; i < 4; i++){
        bolaFogo[i].x = 2000;
        bolaFogo[i].y = 350;
    }

    //velocidade arqueiro = 0;
    arqueiro.velX = 0;
    arqueiro.velY = 0;
}

function gameOver(){
    //se o arqueiro chegar perto demais
    //dragão come arqueiro
    if ((arqueiro.x + arqueiro.width) >= (canvas.width/2)){
        //zera vida do arqueiro
        score.vidaArqueiro = 0;
        score.morto = true;

        //game over
        finalizaJogo();
        desenha.arqueiroMorto(140);
        document.getElementById("titulo").innerHTML = "GAME OVER";

        //move dragão para posição do arqueiro
        dragao.x = arqueiro.x + arqueiro.width;
        dragao.y = arqueiro.y - 100;
    }

    if ((score.vidaArqueiro <= 0) && !score.morto){
        /* se a vida do arqueiro acabar, e
           ele não está morto, o arqueiro é
           queimado pelo dragão, game over */
        score.vidaArqueiro = 0;
        finalizaJogo();
        desenha.arqueiroQueimado();
        document.getElementById("titulo").innerHTML = "GAME OVER";
    }

    if (score.vidaDragao <= 0){
        //se a vida do dragão acabar, jogador vence
        score.vidaDragao = 0;
        finalizaJogo();
        desenha.dragaoMorto();
        document.getElementById("titulo").innerHTML = "O dragão está morto";
    }
}

function random(min, max) {
    //gera um numero aleatorio no intervalo min, max
    return Math.floor(Math.random() * (max - min + 1)) + min;
}