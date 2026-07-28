(function(){
  "use strict";

  /* ---------------- DADOS DO JOGO ---------------- */
  const CATEGORIAS = {
    papel:    { nome:"Papel",     cor:"var(--papel)"    , hex:"#1565C0" },
    plastico: { nome:"Plástico",  cor:"var(--plastico)" , hex:"#C62828" },
    vidro:    { nome:"Vidro",     cor:"var(--vidro)"    , hex:"#2E7D32" },
    metal:    { nome:"Metal",     cor:"var(--metal)"    , hex:"#F9A825" },
    organico: { nome:"Orgânico",  cor:"var(--organico)" , hex:"#6D4C41" }
  };

  const ITENS = [
    { emoji:"📰", nome:"Jornal",            cat:"papel" },
    { emoji:"📦", nome:"Caixa de papelão",  cat:"papel" },
    { emoji:"🧻", nome:"Rolo de papel",     cat:"papel" },
    { emoji:"✉️", nome:"Envelope",          cat:"papel" },
    { emoji:"🥤", nome:"Copo plástico",     cat:"plastico" },
    { emoji:"🧴", nome:"Frasco de shampoo", cat:"plastico" },
    { emoji:"🛍️", nome:"Sacola plástica",   cat:"plastico" },
    { emoji:"🥡", nome:"Pote de marmita",   cat:"plastico" },
    { emoji:"🍾", nome:"Garrafa de vidro",  cat:"vidro" },
    { emoji:"🫙", nome:"Pote de vidro",     cat:"vidro" },
    { emoji:"🍷", nome:"Taça quebrada",     cat:"vidro" },
    { emoji:"🥫", nome:"Lata de conserva",  cat:"metal" },
    { emoji:"🔧", nome:"Parafuso",          cat:"metal" },
    { emoji:"🪛", nome:"Prego enferrujado", cat:"metal" },
    { emoji:"🥄", nome:"Colher velha",      cat:"metal" },
    { emoji:"🍌", nome:"Casca de banana",   cat:"organico" },
    { emoji:"🍎", nome:"Maçã mordida",      cat:"organico" },
    { emoji:"🥕", nome:"Sobra de cenoura",  cat:"organico" },
    { emoji:"🍂", nome:"Folhas secas",      cat:"organico" },
    { emoji:"🥚", nome:"Casca de ovo",      cat:"organico" }
  ];

  const SLOTS = [
    { top:14, left:16 }, { top:14, left:50 }, { top:14, left:84 },
    { top:50, left:10 }, { top:50, left:90 },
    { top:84, left:20 }, { top:84, left:50 }, { top:84, left:80 }
  ];

  const DURACAO_JOGO = 45;
  const INTERVALO_TROCA_LIXEIRAS = 3600;
  const CHAVE_RANKING = "recicla_ja_ranking_v1";

  /* ---------------- ESTADO ---------------- */
  let nomeJogador = "";
  let pontos = 0;
  let tempoRestante = DURACAO_JOGO;
  let timerId = null;
  let trocaLixeirasId = null;
  let itemAtual = null;
  let itemSelecionadoEl = null;
  let arrastando = null;

  const $ = (sel) => document.querySelector(sel);
  const telaLogin = $("#tela-login");
  const telaJogo = $("#tela-jogo");
  const telaFim = $("#tela-fim");
  const campoJogo = $("#campo-jogo");
  const inputNome = $("#input-nome");
  const erroNome = $("#erro-nome");

  /* ---------------- LEGENDA NA TELA DE LOGIN ---------------- */
  function montarLegenda(){
    const wrap = $("#legenda-lixeiras");
    wrap.innerHTML = "";
    Object.values(CATEGORIAS).forEach(c=>{
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.style.background = c.hex;
      chip.innerHTML = `<span class="bola"></span>${c.nome}`;
      wrap.appendChild(chip);
    });
  }
  montarLegenda();

  /* ---------------- SVG DE LIXEIRA ---------------- */
  function svgLixeira(hex){
    return `
      <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
        <rect class="corpo" x="18" y="34" width="64" height="66" rx="10" fill="${hex}" stroke="#1F2B22" stroke-width="4"/>
        <rect x="30" y="46" width="8" height="42" rx="3" fill="rgba(255,255,255,0.35)"/>
        <rect x="46" y="46" width="8" height="42" rx="3" fill="rgba(255,255,255,0.35)"/>
        <rect x="62" y="46" width="8" height="42" rx="3" fill="rgba(255,255,255,0.35)"/>
        <g class="tampa">
          <rect x="12" y="18" width="76" height="16" rx="8" fill="${hex}" stroke="#1F2B22" stroke-width="4"/>
          <rect x="40" y="6" width="20" height="12" rx="4" fill="${hex}" stroke="#1F2B22" stroke-width="4"/>
        </g>
      </svg>`;
  }

  /* ---------------- VALIDAÇÃO DO NOME ---------------- */
  inputNome.addEventListener("input", ()=>{ erroNome.textContent = ""; });
  inputNome.addEventListener("keydown", (e)=>{ if(e.key === "Enter") iniciarJogoComNome(); });

  $("#btn-jogar").addEventListener("click", iniciarJogoComNome);

  function iniciarJogoComNome(){
    const valor = inputNome.value.trim();
    if(valor.length < 2){
      erroNome.textContent = "Digite um nome com pelo menos 2 letras.";
      return;
    }
    nomeJogador = valor.slice(0,18);
    iniciarJogo();
  }

  /* ---------------- FLUXO DE TELAS ---------------- */
  function mostrarTela(tela){
    [telaLogin, telaJogo, telaFim].forEach(t=> t.style.display = "none");
    tela.style.display = (tela === telaJogo) ? "block" : "block";
  }

  $("#btn-jogar-de-novo").addEventListener("click", ()=>{ iniciarJogo(); });
  $("#btn-trocar-nome").addEventListener("click", ()=>{
    mostrarTela(telaLogin);
    inputNome.value = "";
    inputNome.focus();
  });
  $("#btn-ver-ranking").addEventListener("click", async ()=>{
    if(!nomeJogador) nomeJogador = "Visitante";
    mostrarTela(telaFim);
    $("#pontos-finais").textContent = "—";
    $(".resultado .selo").textContent = "Ranking geral";
    $("#msg-final").textContent = "Veja quem já jogou.";
    await carregarRanking();
  });

  /* ---------------- INICIAR PARTIDA ---------------- */
  function iniciarJogo(){
    pontos = 0;
    tempoRestante = DURACAO_JOGO;
    $("#hud-nome").textContent = nomeJogador;
    $("#hud-pontos").textContent = "0";
    $("#hud-tempo-valor").textContent = tempoRestante;
    $("#hud-tempo").classList.remove("alerta");

    mostrarTela(telaJogo);
    limparCampo();
    criarLixeiras();
    novoItem();

    clearInterval(timerId);
    clearInterval(trocaLixeirasId);
    timerId = setInterval(tickTempo, 1000);
    trocaLixeirasId = setInterval(embaralharLixeiras, INTERVALO_TROCA_LIXEIRAS);
  }

  function limparCampo(){
    campoJogo.querySelectorAll(".lixeira, .item-lixo").forEach(el=>el.remove());
  }

  function tickTempo(){
    tempoRestante--;
    $("#hud-tempo-valor").textContent = tempoRestante;
    if(tempoRestante <= 10) $("#hud-tempo").classList.add("alerta");
    if(tempoRestante <= 0){
      clearInterval(timerId);
      clearInterval(trocaLixeirasId);
      fimDeJogo();
    }
  }

  /* ---------------- LIXEIRAS ---------------- */
  let lixeirasEls = {};

  function sortearSlots(qtd){
    const copia = [...SLOTS];
    for(let i=copia.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [copia[i],copia[j]] = [copia[j],copia[i]];
    }
    return copia.slice(0, qtd);
  }

  function criarLixeiras(){
    lixeirasEls = {};
    const chaves = Object.keys(CATEGORIAS);
    const slots = sortearSlots(chaves.length);
    chaves.forEach((chave, i)=>{
      const c = CATEGORIAS[chave];
      const el = document.createElement("div");
      el.className = "lixeira";
      el.dataset.cat = chave;
      el.style.top = slots[i].top + "%";
      el.style.left = slots[i].left + "%";
      el.innerHTML = svgLixeira(c.hex) + `<div class="rotulo-lixeira">${c.nome}</div>`;

      el.addEventListener("click", ()=> tentarSoltarEm(chave, el));
      el.addEventListener("dragover", (e)=> e.preventDefault());
      el.addEventListener("drop", (e)=>{ e.preventDefault(); tentarSoltarEm(chave, el); });

      campoJogo.appendChild(el);
      lixeirasEls[chave] = el;
    });
  }

  function embaralharLixeiras(){
    const chaves = Object.keys(CATEGORIAS);
    const slots = sortearSlots(chaves.length);
    chaves.forEach((chave, i)=>{
      const el = lixeirasEls[chave];
      el.style.top = slots[i].top + "%";
      el.style.left = slots[i].left + "%";
    });
  }

  /* ---------------- ITEM DE LIXO ---------------- */
  function novoItem(){
    if(itemSelecionadoEl) itemSelecionadoEl.remove();
    itemAtual = ITENS[Math.floor(Math.random()*ITENS.length)];

    const el = document.createElement("div");
    el.className = "item-lixo";
    el.style.left = "50%";
    el.style.top = "50%";
    el.setAttribute("draggable","true");
    el.innerHTML = `${itemAtual.emoji}<span class="nome-item">${itemAtual.nome}</span>`;

    el.addEventListener("click", ()=>{
      el.classList.toggle("selecionado");
    });

    el.addEventListener("dragstart", (e)=>{
      el.classList.add("arrastando");
      e.dataTransfer.setData("text/plain","item");
    });
    el.addEventListener("dragend", ()=>{ el.classList.remove("arrastando"); });

    ativarArrasteTouch(el);

    campoJogo.appendChild(el);
    itemSelecionadoEl = el;
  }

  function ativarArrasteTouch(el){
    el.addEventListener("touchstart", (e)=>{
      arrastando = el;
      el.classList.add("arrastando");
    }, {passive:true});

    el.addEventListener("touchmove", (e)=>{
      if(arrastando !== el) return;
      const t = e.touches[0];
      const rect = campoJogo.getBoundingClientRect();
      const x = ((t.clientX - rect.left) / rect.width) * 100;
      const y = ((t.clientY - rect.top) / rect.height) * 100;
      el.style.left = Math.min(96, Math.max(4,x)) + "%";
      el.style.top = Math.min(96, Math.max(4,y)) + "%";
      e.preventDefault();
    }, {passive:false});

    el.addEventListener("touchend", (e)=>{
      el.classList.remove("arrastando");
      arrastando = null;
      const t = e.changedTouches[0];
      const alvo = document.elementFromPoint(t.clientX, t.clientY);
      const lixeiraAlvo = alvo ? alvo.closest(".lixeira") : null;
      if(lixeiraAlvo){
        tentarSoltarEm(lixeiraAlvo.dataset.cat, lixeiraAlvo);
      } else {
        el.style.left = "50%";
        el.style.top = "50%";
      }
    });
  }

  function tentarSoltarEm(catLixeira, lixeiraEl){
    if(!itemAtual || !itemSelecionadoEl) return;

    if(catLixeira === itemAtual.cat){
      pontos += 10;
      $("#hud-pontos").textContent = pontos;
      lixeiraEl.classList.remove("erro");
      void lixeiraEl.offsetWidth;
      lixeiraEl.classList.add("acerto");
      explodirParticulas(lixeiraEl, CATEGORIAS[catLixeira].hex);
      mostrarFlutuante(lixeiraEl, "+10", CATEGORIAS[catLixeira].hex);
      setTimeout(()=> lixeiraEl.classList.remove("acerto"), 500);
      novoItem();
    } else {
      pontos = Math.max(0, pontos - 5);
      $("#hud-pontos").textContent = pontos;
      lixeiraEl.classList.remove("acerto");
      void lixeiraEl.offsetWidth;
      lixeiraEl.classList.add("erro");
      mostrarFlutuante(lixeiraEl, "-5", "#C62828");
      setTimeout(()=> lixeiraEl.classList.remove("erro"), 400);
      itemSelecionadoEl.style.left = "50%";
      itemSelecionadoEl.style.top = "50%";
      itemSelecionadoEl.classList.remove("selecionado");
    }
  }

  function explodirParticulas(referenciaEl, hex){
    const rect = referenciaEl.getBoundingClientRect();
    const campoRect = campoJogo.getBoundingClientRect();
    const cx = rect.left - campoRect.left + rect.width/2;
    const cy = rect.top - campoRect.top + rect.height/2;
    for(let i=0;i<10;i++){
      const p = document.createElement("div");
      p.className = "particula";
      p.style.left = cx+"px";
      p.style.top = cy+"px";
      p.style.background = hex;
      const ang = Math.random()*Math.PI*2;
      const dist = 40 + Math.random()*40;
      p.style.setProperty("--dx", Math.cos(ang)*dist + "px");
      p.style.setProperty("--dy", Math.sin(ang)*dist + "px");
      p.style.setProperty("--rot", (Math.random()*360)+"deg");
      campoJogo.appendChild(p);
      setTimeout(()=>p.remove(), 720);
    }
  }

  function mostrarFlutuante(referenciaEl, texto, hex){
    const rect = referenciaEl.getBoundingClientRect();
    const campoRect = campoJogo.getBoundingClientRect();
    const cx = rect.left - campoRect.left + rect.width/2;
    const cy = rect.top - campoRect.top;
    const f = document.createElement("div");
    f.className = "flutuante";
    f.textContent = texto;
    f.style.color = hex;
    f.style.left = cx+"px";
    f.style.top = cy+"px";
    campoJogo.appendChild(f);
    setTimeout(()=>f.remove(), 800);
  }

  /* ---------------- FIM DE JOGO / RANKING ---------------- */
  async function fimDeJogo(){
    mostrarTela(telaFim);
    $(".resultado .selo").textContent = "Tempo esgotado";
    $("#pontos-finais").textContent = pontos;
    $("#msg-final").textContent = mensagemFinal(pontos);

    await salvarPontuacao(nomeJogador, pontos);
    await carregarRanking(pontos);
  }

  function mensagemFinal(p){
    if(p >= 150) return "Uau, mestre da reciclagem! ♻️";
    if(p >= 80) return "Muito bem, quase profissional!";
    if(p >= 40) return "Bom trabalho, continue praticando.";
    return "Vale mais uma tentativa!";
  }

  async function salvarPontuacao(nome, pontuacao){
  try{
    let lista = [];
    const bruto = localStorage.getItem(CHAVE_RANKING);
    if(bruto) lista = JSON.parse(bruto);

    lista.push({ nome, pontos: pontuacao, data: new Date().toISOString() });
    lista.sort((a,b)=> b.pontos - a.pontos);
    lista = lista.slice(0, 20);

    localStorage.setItem(CHAVE_RANKING, JSON.stringify(lista));
  }catch(e){
    console.error("Não foi possível salvar o ranking:", e);
  }
}

  async function carregarRanking(pontuacaoDestaque){
  const ul = $("#ranking-lista");
  ul.innerHTML = `<li class="aviso-carregando">Carregando ranking...</li>`;
  try{
    let lista = [];
    const bruto = localStorage.getItem(CHAVE_RANKING);
    if(bruto) lista = JSON.parse(bruto);

    if(!lista.length){
      ul.innerHTML = `<li class="aviso-carregando">Ainda não há ninguém no ranking. Seja o primeiro!</li>`;
      return;
    }

    ul.innerHTML = "";
    lista.forEach((item, i)=>{
      const li = document.createElement("li");
      const destaque = (pontuacaoDestaque !== undefined && item.nome === nomeJogador && item.pontos === pontuacaoDestaque);
      if(destaque) li.classList.add("voce");
      li.innerHTML = `
        <span class="rk-pos">${i+1}º</span>
        <span class="rk-nome">${escaparHTML(item.nome)}</span>
        <span class="rk-pontos">${item.pontos}</span>
      `;
      ul.appendChild(li);
    });
  }catch(e){
    ul.innerHTML = `<li class="aviso-carregando">Não foi possível carregar o ranking agora.</li>`;
  }
}

  function escaparHTML(str){
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  mostrarTela(telaLogin);
})();
