
const telaInicio = document.getElementById("inicio");
const telaJogo = document.getElementById("jogo");
const telaFim = document.getElementById("fimJogo");
const telaRanking = document.getElementById("rankingTela");

const btnJogar = document.getElementById("btnJogar");
const btnRanking = document.getElementById("btnRanking");
const voltarInicio = document.getElementById("voltarInicio");
const jogarNovamente = document.getElementById("jogarNovamente");

const nomeInput = document.getElementById("nomeJogador");

const lixoAtual = document.getElementById("lixoAtual");

const pontosHTML = document.getElementById("pontos");
const tempoHTML = document.getElementById("tempo");
const comboHTML = document.getElementById("combo");
const barra = document.getElementById("barra");

const hudNome = document.getElementById("hudNome");

let jogador = "";

let pontos = 0;
let tempo = 60;
let combo = 1;

let acertos = 0;
let erros = 0;

let intervalo;


const lixos = [

{
emoji:"📰",
tipo:"papel"
},

{
emoji:"📦",
tipo:"papel"
},

{
emoji:"🧴",
tipo:"plastico"
},

{
emoji:"🥤",
tipo:"plastico"
},

{
emoji:"🍾",
tipo:"vidro"
},

{
emoji:"🪟",
tipo:"vidro"
},

{
emoji:"🥫",
tipo:"metal"
},

{
emoji:"🔩",
tipo:"metal"
},

{
emoji:"🍌",
tipo:"organico"
},

{
emoji:"🍎",
tipo:"organico"
},

{
emoji:"🚬",
tipo:"rejeito"
}

];

let lixoEscolhido;


btnJogar.onclick = ()=>{

if(nomeInput.value.trim()==""){

alert("Digite seu nome!");

return;

}

jogador = nomeInput.value;

hudNome.innerHTML = jogador;

telaInicio.classList.add("escondido");

telaJogo.classList.remove("escondido");

novoLixo();

iniciarTempo();

}

function novoLixo(){

let sorteio = Math.floor(Math.random()*lixos.length);

lixoEscolhido = lixos[sorteio];

lixoAtual.innerHTML = lixoEscolhido.emoji;

}

lixoAtual.addEventListener("dragstart",(e)=>{

e.dataTransfer.setData("tipo",lixoEscolhido.tipo);

});


const lixeiras = document.querySelectorAll(".lixeira");

lixeiras.forEach(lixeira=>{

lixeira.addEventListener("dragover",(e)=>{

e.preventDefault();

});

lixeira.addEventListener("drop",(e)=>{

e.preventDefault();

let tipo = e.dataTransfer.getData("tipo");

if(tipo==lixeira.dataset.tipo){

acertou();

}else{

errou();

}

});

});

function acertou(){

acertos++;

combo++;

pontos += 100*combo;

pontosHTML.innerHTML = pontos;

comboHTML.innerHTML = "x"+combo;

novoLixo();

}

function errou(){

erros++;

combo=1;

pontos-=50;

if(pontos<0){

pontos=0;

}

pontosHTML.innerHTML=pontos;

comboHTML.innerHTML="x1";

}

function iniciarTempo(){

intervalo=setInterval(()=>{

tempo--;

tempoHTML.innerHTML=tempo;

barra.style.width=(tempo/60*100)+"%";

if(tempo<=0){

fim();

}

},1000);

}

function fim(){

clearInterval(intervalo);

telaJogo.classList.add("escondido");

telaFim.classList.remove("escondido");

document.getElementById("nomeFinal").innerHTML=jogador;

document.getElementById("pontuacaoFinal").innerHTML=pontos;

document.getElementById("acertos").innerHTML=acertos;

document.getElementById("erros").innerHTML=erros;

let precisao=0;

if(acertos+erros>0){

precisao=Math.round(acertos/(acertos+erros)*100);

}

document.getElementById("precisao").innerHTML=precisao+"%";

}


jogarNovamente.onclick=()=>{

location.reload();

}

btnRanking.onclick=()=>{

telaInicio.classList.add("escondido");

telaRanking.classList.remove("escondido");

}

voltarInicio.onclick=()=>{

telaRanking.classList.add("escondido");

telaInicio.classList.remove("escondido");

}

