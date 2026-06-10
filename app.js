const player = document.getElementById("player");
const lixos = document.querySelectorAll(".lixo");

let x = 50;
let y = 350;

let score = 50;

const perguntas = [

    { pergunta:"Você fecharia a torneira ao escovar os dentes?" },
    { pergunta:"Você reciclaria o lixo da sua casa?" },
    { pergunta:"Você plantaria árvores na sua comunidade?" },
    { pergunta:"Você economizaria energia elétrica?" },
    { pergunta:"Você usaria bicicleta em trajetos curtos?" },
    { pergunta:"Você separaria lixo reciclável?" },
    { pergunta:"Você evitaria desperdício de comida?" },
    { pergunta:"Você recolheria lixo de um parque?" },
    { pergunta:"Você reutilizaria materiais?" },
    { pergunta:"Você ajudaria em projetos ambientais?" }

];

player.style.left = x + "px";
player.style.top = y + "px";

document.addEventListener("keydown", (e) => {

    switch(e.key.toLowerCase()){

        case "w":
            y -= 15;
            break;

        case "s":
            y += 15;
            break;

        case "a":
            x -= 15;
            break;

        case "d":
            x += 15;
            break;

        default:
            return;
    }

    x = Math.max(0, Math.min(x, 950));
    y = Math.max(0, Math.min(y, 520));

    player.style.left = x + "px";
    player.style.top = y + "px";

    verificarColisao();
});

function verificarColisao(){

    lixos.forEach(lixo => {

        if(lixo.style.display === "none") return;

        const lx = lixo.offsetLeft;
        const ly = lixo.offsetTop;

        if(
            x < lx + 35 &&
            x + 48 > lx &&
            y < ly + 35 &&
            y + 64 > ly
        ){

            lixo.style.display = "none";

            abrirPergunta();
        }
    });
}

function abrirPergunta(){

    const sorteio =
    perguntas[Math.floor(Math.random() * perguntas.length)];

    document.getElementById("pergunta").innerText =
    sorteio.pergunta;

    document.getElementById("quiz").style.display = "block";
}

function responder(valor){

    document.getElementById("quiz").style.display = "none";

    switch(valor){

        case 1:
            score += 10;
            break;

        case 2:
            score -= 10;
            break;
    }

    if(score > 100) score = 100;
    if(score < 0) score = 0;

    atualizarMundo();
}

function atualizarMundo(){

    document.getElementById("energia").style.width =
    score + "%";

    document.getElementById("pontos").innerText =
    score + "%";

    const game = document.getElementById("game");

    switch(true){

        case score >= 80:
            game.style.filter = "saturate(1.3)";
            break;

        case score >= 50:
            game.style.filter = "saturate(0.9)";
            break;

        default:
            game.style.filter = "grayscale(0.8)";
    }

    if(score === 100){

        setTimeout(() => {

            alert("🏆 Você salvou o planeta!");

        }, 300);
    }
}