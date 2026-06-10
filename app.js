const perguntas = {

    crianca: [
        {
            pergunta: "Você joga lixo no chão?",
            op1: "Não, uso a lixeira",
            op2: "Sim, às vezes"
        },
        {
            pergunta: "Você fecha a torneira ao escovar os dentes?",
            op1: "Sempre",
            op2: "Nem sempre"
        },
        {
            pergunta: "Você apaga a luz ao sair do quarto?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você cuida das plantas da sua casa ou escola?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você reutiliza folhas de papel?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você separa lixo reciclável?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você evita desperdiçar comida?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você gosta de aprender sobre animais e natureza?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você usa garrafa reutilizável?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você ajuda a manter sua escola limpa?",
            op1: "Sim",
            op2: "Não"
        }
    ],

    fundamental: [
        {
            pergunta: "Você separa materiais recicláveis?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você evita desperdício de energia?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você fecha o chuveiro enquanto se ensaboa?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você evita usar plástico descartável?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você participa de ações ambientais na escola?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você reutiliza materiais quando possível?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você joga lixo eletrônico em locais adequados?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você utiliza os dois lados da folha?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você prefere caminhar em trajetos curtos?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você incentiva amigos a cuidar do meio ambiente?",
            op1: "Sim",
            op2: "Não"
        }
    ],

    medio: [
        {
            pergunta: "Você apoia ações ambientais na sua comunidade?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você utiliza meios de transporte sustentáveis?",
            op1: "Sempre que possível",
            op2: "Raramente"
        },
        {
            pergunta: "Você conhece os impactos das mudanças climáticas?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você reduz o consumo excessivo de produtos?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você busca consumir de empresas sustentáveis?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você economiza água diariamente?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você evita desperdício de alimentos?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você participa de debates ou projetos ambientais?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você entende a importância da reciclagem?",
            op1: "Sim",
            op2: "Não"
        },
        {
            pergunta: "Você acredita que suas atitudes influenciam o futuro do planeta?",
            op1: "Sim",
            op2: "Não"
        }
    ]
};

let nivelSelecionado;
let indicePergunta = 0;
let respostas = [];

function iniciarQuiz(nivel){

    nivelSelecionado = nivel;

    document.getElementById("inicio").classList.add("oculto");
    document.getElementById("quiz").classList.remove("oculto");

    mostrarPergunta();
}

function mostrarPergunta(){

    let perguntaAtual =
        perguntas[nivelSelecionado][indicePergunta];

    document.getElementById("pergunta").innerText =
        perguntaAtual.pergunta;

    document.getElementById("opcao1").innerText =
        perguntaAtual.op1;

    document.getElementById("opcao2").innerText =
        perguntaAtual.op2;

    document.getElementById("opcao1").onclick =
        () => responder(1);

    document.getElementById("opcao2").onclick =
        () => responder(2);
}

function responder(valor){

    respostas.push(valor);

    indicePergunta++;

    if(indicePergunta < perguntas[nivelSelecionado].length){
        mostrarPergunta();
    }else{
        mostrarResultado();
    }
}

function mostrarResultado(){

    document.getElementById("quiz")
        .classList.add("oculto");

    document.getElementById("resultado")
        .classList.remove("oculto");

    let soma = respostas.reduce((a,b) => a+b, 0);

    if(soma <= respostas.length * 1.5){

        document.getElementById("tituloResultado")
            .innerHTML = "🌱 Mundo Sustentável";

        document.getElementById("textoResultado")
            .innerHTML =
            "Suas atitudes ajudam a construir um planeta mais verde.";

        document.getElementById("imagemResultado")
            .src =
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e";

    }else{

        document.getElementById("tituloResultado")
            .innerHTML = "🌫️ Mundo Poluído";

        document.getElementById("textoResultado")
            .innerHTML =
            "Pequenas mudanças nas suas atitudes podem melhorar o futuro do planeta.";

        document.getElementById("imagemResultado")
            .src =
            "https://images.unsplash.com/photo-1518391846015-55a9cc003b25";
    }
}