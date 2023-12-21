$(document).ready(function () {
  cardapio.eventos.init();
});

const metodosButtons = Array.from(
  document.querySelectorAll('[data-js^="metodo"]')
);

var cardapio = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 7.5;

var CELULAR_EMPRESA = "5587981356579";

var ENDERECO_EMPRESA = {
  cep: "55291420",
  endereco: "Endereço da Empresa",
  bairro: "Bairro da Empresa",
  cidade: "Cidade",
  numero: "Número",
  complemento: "Complemento",
};

var tipoDoPedido = null;
var nomeDoCliente = null;
var observacao = null;
var metodoPagamento = null;
var troco = null;
var valorTotal = 0;
var totalPessoas = 0;
var horario = null;

cardapio.eventos = {
  init: () => {
    cardapio.metodos.obterItensCardapio();
    cardapio.metodos.carregarBotaoLigar();
    cardapio.metodos.carregarBotaoReserva();
  },
};

cardapio.metodos = {
  // obtem a lista de itens do cardápio
  obterItensCardapio: (categoria = "burgers", vermais = false) => {
    var filtro = MENU[categoria];

    if (!vermais) {
      $("#itensCardapio").html("");
      $("#btnVerMais").removeClass("hidden");
    }

    $.each(filtro, (i, e) => {
      let temp = cardapio.templates.item
        .replace(/\${img}/g, e.img)
        .replace(/\${nome}/g, e.name)
        .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
        .replace(/\${id}/g, e.id);

      // botão ver mais foi clicado (12 itens)
      if (vermais && i >= 8 && i < 12) {
        $("#itensCardapio").append(temp);
      }

      // paginação inicial (8 itens)
      if (!vermais && i < 8) {
        $("#itensCardapio").append(temp);
      }
    });

    // remove o ativo
    $(".container-menu a").removeClass("active");

    // seta o menu para ativo
    $("#menu-" + categoria).addClass("active");
  },

  // clique no botão de ver mais
  verMais: () => {
    var ativo = $(".container-menu a.active").attr("id").split("menu-")[1];
    cardapio.metodos.obterItensCardapio(ativo, true);

    $("#btnVerMais").addClass("hidden");
  },

  // diminuir a quantidade do item no cardapio
  diminuirQuantidade: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());

    if (qntdAtual > 0) {
      $("#qntd-" + id).text(qntdAtual - 1);
      cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
    } else {
      cardapio.metodos.removerItemCarrinho(id);
    }
  },

  // aumentar a quantidade do item no cardapio
  aumentarQuantidade: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());
    const isFirst = qntdAtual === 0;

    $("#qntd-" + id).text(qntdAtual + 1);
    cardapio.metodos.adicionarAoCarrinho(id, isFirst);
  },

  // adicionar ao carrinho o item do cardápio
  adicionarAoCarrinho: (id, showMessage = true) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());

    if (qntdAtual > 0) {
      // obter a categoria ativa
      var categoria = $(".container-menu a.active")
        .attr("id")
        .split("menu-")[1];

      // obtem a lista de itens
      let filtro = MENU[categoria];

      // obtem o item
      let item = $.grep(filtro, (e, i) => {
        return e.id == id;
      });

      if (item.length > 0) {
        // validar se já existe esse item no carrinho
        let existe = $.grep(MEU_CARRINHO, (elem, index) => {
          return elem.id == id;
        });

        // caso já exista o item no carrinho, só altera a quantidade
        if (existe.length > 0) {
          let objIndex = MEU_CARRINHO.findIndex((obj) => obj.id == id);
          MEU_CARRINHO[objIndex].qntd = qntdAtual;
        }
        // caso ainda não exista o item no carrinho, adiciona ele
        else {
          item[0].qntd = qntdAtual;
          MEU_CARRINHO.push(item[0]);
        }

        if (showMessage) {
          cardapio.metodos.mensagem("Item adicionado ao carrinho", "green");
        }

        cardapio.metodos.atualizarBadgeTotal();
      }
    }
  },

  // atualiza o badge de totais dos botões "Meu carrinho"
  atualizarBadgeTotal: () => {
    var total = 0;

    $.each(MEU_CARRINHO, (i, e) => {
      total += e.qntd;
    });

    if (total > 0) {
      $(".botao-carrinho").removeClass("hidden");
      $(".container-total-carrinho").removeClass("hidden");
    } else {
      $(".botao-carrinho").addClass("hidden");
      $(".container-total-carrinho").addClass("hidden");
    }

    $(".badge-total-carrinho").html(total);
  },

  // abrir a modal de carrinho
  abrirCarrinho: (abrir) => {
    if (abrir) {
      $("body").css("overflow", "hidden");
      $("#modalCarrinho").removeClass("hidden");
      cardapio.metodos.carregarCarrinho();
    } else {
      $("body").css("overflow", "auto");
      $("#modalCarrinho").addClass("hidden");
    }
  },

  // altera os texto e exibe os botões das etapas
  carregarEtapa: (etapa) => {
    document.querySelector("#corpoViewer").scrollTo(0, 0);

    if (etapa == 1) {
      tipoDoPedido = null;

      $("#corpoPedido").addClass("carrinho");

      $("#lblTituloEtapa").text("Seu carrinho:");
      $("#itensCarrinho").removeClass("hidden");
      $("#reservaContainer").addClass("hidden");
      $("#localEntrega").addClass("hidden");
      $("#metodoPagamento").addClass("hidden");
      $("#enderecoTitle").addClass("hidden");
      $("#resumoCarrinho").addClass("hidden");
      $("#cpfNaNota").addClass("hidden");

      $("#observacaoContainer").removeClass("hidden");

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");

      $("#btnEtapaPedido").removeClass("hidden");
      $("#btnEtapaEndereco").addClass("hidden");
      $("#btnEtapaResumo").addClass("hidden");
      $("#btnVoltar").addClass("hidden");
    }

    if (etapa == 2) {
      $("#corpoPedido").removeClass("carrinho");

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");
      $(".etapa2").addClass("active");

      $("#itensCarrinho").addClass("hidden");
      $("#observacaoContainer").addClass("hidden");
      $("#resumoCarrinho").addClass("hidden");
      $("#btnVoltar").removeClass("hidden");

      $("#btnEtapaPedido").addClass("hidden");
      $("#btnEtapaResumo").addClass("hidden");
      $("#btnEtapaEndereco").removeClass("hidden");
      $("#reservaContainer").removeClass("hidden");
      $("#nomeContainer").removeClass("hidden");
      $("#horarioContainer").addClass("hidden");
      $("#pessoasContainer").addClass("hidden");
      $("#cpfNaNota").addClass("hidden");

      if (tipoDoPedido === "reserva") {
        $("#lblTituloEtapa").text("Faça sua reserva:");
        $("#horarioContainer").removeClass("hidden");
        $("#pessoasContainer").removeClass("hidden");
      } else if (tipoDoPedido === "entrega") {
        $("#nomeContainer").addClass("hidden");

        $("#enderecoTitle").removeClass("hidden");

        $("#lblTituloEtapa").text("Informe os dados:");

        $("#localEntrega").removeClass("hidden");
        $("#metodoPagamento").removeClass("hidden");
      } else if (tipoDoPedido === "busca") {
        $("#lblTituloEtapa").text("Venha buscar:");
        $("#horarioContainer").removeClass("hidden");
      }
    }

    if (etapa == 3) {
      $("#corpoPedido").removeClass("carrinho");

      $("#lblTituloEtapa").text("Resumo do pedido:");
      $("#itensCarrinho").addClass("hidden");
      $("#reservaContainer").addClass("hidden");
      $("#localEntrega").addClass("hidden");
      $("#resumoCarrinho").removeClass("hidden");
      $("#metodoPagamento").addClass("hidden");
      $("#enderecoTitle").addClass("hidden");
      $("#cpfNaNota").removeClass("hidden");

      if (tipoDoPedido === "reserva" || tipoDoPedido == "busca") {
        $("#metodoPagamentoTitle").addClass("hidden");
        $("#metodoPagamentoResumo").addClass("hidden");
        $("#metodoPagamentoResumo").html("");
      } else if (tipoDoPedido === "entrega") {
        $("#metodoPagamentoTitle").removeClass("hidden");
        $("#metodoPagamentoResumo").removeClass("hidden");
      }

      $("#observacaoContainer").addClass("hidden");

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");
      $(".etapa2").addClass("active");
      $(".etapa3").addClass("active");

      $("#btnEtapaPedido").addClass("hidden");
      $("#btnEtapaEndereco").addClass("hidden");
      $("#btnEtapaResumo").removeClass("hidden");
      $("#btnVoltar").removeClass("hidden");
    }
  },

  // botão de voltar etapa
  voltarEtapa: () => {
    let etapa = $(".etapa.active").length;

    cardapio.metodos.carregarEtapa(etapa - 1);

    cardapio.metodos.carregarValores();
  },

  // carrega a lista de itens do carrinho
  carregarCarrinho: () => {
    cardapio.metodos.carregarEtapa(1);

    if (MEU_CARRINHO.length > 0) {
      $("#itensCarrinho").html("");

      $.each(MEU_CARRINHO, (i, e) => {
        let temp = cardapio.templates.itemCarrinho
          .replace(/\${img}/g, e.img)
          .replace(/\${nome}/g, e.name)
          .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
          .replace(/\${id}/g, e.id)
          .replace(/\${qntd}/g, e.qntd);

        $("#itensCarrinho").append(temp);

        // último item
        if (i + 1 == MEU_CARRINHO.length) {
          cardapio.metodos.carregarValores();
        }
      });
    } else {
      $("#itensCarrinho").html(
        '<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>'
      );
      cardapio.metodos.carregarValores();
    }
  },

  // diminuir quantidade do item no carrinho
  diminuirQuantidadeCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

    if (qntdAtual > 1) {
      $("#qntd-carrinho-" + id).text(qntdAtual - 1);
      cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
    } else {
      cardapio.metodos.removerItemCarrinho(id);
    }
  },

  // aumentar quantidade do item no carrinho
  aumentarQuantidadeCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
    $("#qntd-carrinho-" + id).text(qntdAtual + 1);
    cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);
  },

  // botão remover item do carrinho
  removerItemCarrinho: (id) => {
    MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => {
      return e.id != id;
    });
    cardapio.metodos.carregarCarrinho();

    // atualiza o botão carrinho com a quantidade atualizada
    cardapio.metodos.atualizarBadgeTotal();
  },

  // atualiza o carrinho com a quantidade atual
  atualizarCarrinho: (id, qntd) => {
    let objIndex = MEU_CARRINHO.findIndex((obj) => obj.id == id);
    MEU_CARRINHO[objIndex].qntd = qntd;

    // atualiza o botão carrinho com a quantidade atualizada
    cardapio.metodos.atualizarBadgeTotal();

    // atualiza os valores (R$) totais do carrinho
    cardapio.metodos.carregarValores();
  },

  // carrega os valores de SubTotal, Entrega e Total
  carregarValores: () => {
    VALOR_CARRINHO = 0;

    $("#lblSubTotal").text("R$ 0,00");
    $("#lblValorEntrega").text("+ R$ 0,00");
    $("#lblValorTotal").text("R$ 0,00");

    $.each(MEU_CARRINHO, (i, e) => {
      VALOR_CARRINHO += parseFloat(e.price * e.qntd);

      if (i + 1 == MEU_CARRINHO.length) {
        $("#lblSubTotal").text(
          `R$ ${VALOR_CARRINHO.toFixed(2).replace(".", ",")}`
        );

        if (tipoDoPedido === "entrega") {
          $("#entregaP").removeClass("hidden");

          $("#lblValorEntrega").text(
            `+ R$ ${VALOR_ENTREGA.toFixed(2).replace(".", ",")}`
          );
        } else if (tipoDoPedido === "reserva") {
          $("#entregaP").addClass("hidden");
        }

        const valorDaEntrega = tipoDoPedido === "entrega" ? VALOR_ENTREGA : 0;

        $("#lblValorTotal").text(
          `R$ ${(VALOR_CARRINHO + valorDaEntrega).toFixed(2).replace(".", ",")}`
        );

        valorTotal = VALOR_CARRINHO + valorDaEntrega;
      }
    });
  },

  // carregar a etapa enderecos
  carregarEndereco: () => {
    if (MEU_CARRINHO.length <= 0) {
      cardapio.metodos.mensagem("Seu carrinho está vazio.");
      return;
    }

    tipoDoPedido = "entrega";
    observacao = $("#observacao").val().trim();
    cardapio.metodos.carregarEtapa(2);
    cardapio.metodos.carregarValores();
  },

  irNoEstabelecimento: (tipo) => {
    if (MEU_CARRINHO.length <= 0) {
      cardapio.metodos.mensagem("Seu carrinho está vazio.");
      return;
    }

    metodoPagamento = null;
    troco = null;

    metodosButtons.forEach((button) => {
      button.classList.remove("active");
    });

    tipoDoPedido = tipo;
    observacao = $("#observacao").val().trim();
    cardapio.metodos.carregarEtapa(2);
    cardapio.metodos.carregarValores();
    cardapio.metodos.carregarResumo();
  },

  // API ViaCEP
  buscarCep: () => {
    // cria a variavel com o valor do cep
    var cep = $("#txtCEP").val().trim().replace(/\D/g, "");

    // verifica se o CEP possui valor informado
    if (cep != "") {
      // Expressão regular para validar o CEP
      var validacep = /^[0-9]{8}$/;

      if (validacep.test(cep)) {
        $.getJSON(
          "https://viacep.com.br/ws/" + cep + "/json/?callback=?",
          function (dados) {
            if (!("erro" in dados)) {
              // Atualizar os campos com os valores retornados
              $("#txtEndereco").val(dados.logradouro);
              $("#txtBairro").val(dados.bairro);
              $("#txtCidade").val(dados.localidade);
              $("#txtNumero").focus();
            } else {
              cardapio.metodos.mensagem(
                "CEP não encontrado. Preencha as informações manualmente."
              );
              $("#txtEndereco").focus();
            }
          }
        );
      } else {
        cardapio.metodos.mensagem("Formato do CEP inválido.");
        $("#txtCEP").focus();
      }
    } else {
      cardapio.metodos.mensagem("Informe o CEP, por favor.");
      $("#txtCEP").focus();
    }
  },

  // validação antes de prosseguir para a etapa 3
  resumoPedido: () => {
    if (tipoDoPedido === "reserva") {
      let nomeVal = $("#nomeCliente").val().trim();
      let horarioVal = $("#horario").val().trim();
      let pessoasVal = $("#pessoas").val().trim();

      if (nomeVal.length <= 0) {
        cardapio.metodos.mensagem("Informe o seu nome, por favor.");
        $("#nomeCliente").focus();
        return;
      }

      if (horarioVal.length <= 0) {
        cardapio.metodos.mensagem("Informe o horário, por favor.");
        $("#horario").focus();
        return;
      }

      if (pessoasVal.length <= 0) {
        cardapio.metodos.mensagem(
          "Informe a quantidade de pessoas, por favor."
        );
        $("#pessoas").focus();
        return;
      }

      nomeDoCliente = nomeVal;
      horario = horarioVal;
      totalPessoas = parseInt(pessoasVal);

      cardapio.metodos.carregarEtapa(3);
      cardapio.metodos.carregarResumo();

      return;
    }

    if (tipoDoPedido === "busca") {
      let nomeVal = $("#nomeCliente").val().trim();
      let horarioVal = $("#horario").val().trim();

      if (nomeVal.length <= 0) {
        cardapio.metodos.mensagem("Informe o seu nome, por favor.");
        $("#nomeCliente").focus();
        return;
      }

      if (horarioVal.length <= 0) {
        cardapio.metodos.mensagem("Informe o horário, por favor.");
        $("#horario").focus();
        return;
      }

      nomeDoCliente = nomeVal;
      horario = horarioVal;

      cardapio.metodos.carregarEtapa(3);
      cardapio.metodos.carregarResumo();
      return;
    }

    let cep = $("#txtCEP").val().trim();
    let endereco = $("#txtEndereco").val().trim();
    let bairro = $("#txtBairro").val().trim();
    let cidade = $("#txtCidade").val().trim();
    let numero = $("#txtNumero").val().trim();
    let complemento = $("#txtComplemento").val().trim();

    if (cep.length <= 0) {
      cardapio.metodos.mensagem("Informe o CEP, por favor.");
      $("#txtCEP").focus();
      return;
    }

    if (endereco.length <= 0) {
      cardapio.metodos.mensagem("Informe o Endereço, por favor.");
      $("#txtEndereco").focus();
      return;
    }

    if (bairro.length <= 0) {
      cardapio.metodos.mensagem("Informe o Bairro, por favor.");
      $("#txtBairro").focus();
      return;
    }

    if (cidade.length <= 0) {
      cardapio.metodos.mensagem("Informe a Cidade, por favor.");
      $("#txtCidade").focus();
      return;
    }

    if (numero.length <= 0) {
      cardapio.metodos.mensagem("Informe o Número, por favor.");
      $("#txtNumero").focus();
      return;
    }

    if (!metodoPagamento) {
      cardapio.metodos.mensagem("Informe o Método de pagamento, por favor.");
      $("#metodoPagamento").get(0).scrollIntoView();
      return;
    }

    let trocoVal = $("#troco").val()
      ? parseFloat($("#troco").val())
      : undefined;

    if (metodoPagamento === "dinheiro") {
      if (trocoVal === undefined || isNaN(trocoVal)) {
        cardapio.metodos.mensagem("Informe o troco, por favor.");
        $("#troco").focus();
        return;
      }

      if (trocoVal < 0) {
        cardapio.metodos.mensagem(
          "Informe um valor válido para o troco, por favor."
        );
        $("#troco").focus();
        return;
      }

      if (trocoVal < valorTotal) {
        cardapio.metodos.mensagem(
          "O valor de pagamento deve ser maior do que o total da compra."
        );
        $("#troco").focus();
        return;
      }
    }

    troco = trocoVal;

    MEU_ENDERECO = {
      cep: cep,
      endereco: endereco,
      bairro: bairro,
      cidade: cidade,
      numero: numero,
      complemento: complemento,
    };

    cardapio.metodos.carregarEtapa(3);
    cardapio.metodos.carregarResumo();
  },

  // carrega a etapa de Resumo do pedido
  carregarResumo: () => {
    $("#listaItensResumo").html("");

    $.each(MEU_CARRINHO, (i, e) => {
      let temp = cardapio.templates.itemResumo
        .replace(/\${img}/g, e.img)
        .replace(/\${nome}/g, e.name)
        .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
        .replace(/\${qntd}/g, e.qntd);

      $("#listaItensResumo").append(temp);
    });

    if (tipoDoPedido === "entrega") {
      $("#empresaMaps").addClass("hidden");
      $("#metodoPagamentoTitle").removeClass("hidden");
      $("#metodoPagamentoResumo").removeClass("hidden");

      $("#entregaLabel").text("Local da entrega:");

      $("#resumoEndereco").html(
        `${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`
      );

      $("#cidadeEndereco").html(
        `${MEU_ENDERECO.cidade} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`
      );
    } else if (tipoDoPedido === "reserva" || tipoDoPedido === "busca") {
      $("#empresaMaps").removeClass("hidden");
      $("#metodoPagamentoTitle").addClass("hidden");
      $("#metodoPagamentoResumo").removeClass("hidden");

      $("#entregaLabel").text(`Te esperamos aqui, ${nomeDoCliente}:`);

      $("#resumoEndereco").html(
        `${ENDERECO_EMPRESA?.endereco}, ${ENDERECO_EMPRESA?.numero}, ${ENDERECO_EMPRESA?.bairro}`
      );

      $("#cidadeEndereco").html(
        `${ENDERECO_EMPRESA?.cidade} / ${ENDERECO_EMPRESA?.cep} ${ENDERECO_EMPRESA?.complemento}`
      );
    }

    if (tipoDoPedido === "entrega") {
      if (metodoPagamento === "dinheiro") {
        const trocoFormatado = Number(troco).toFixed(2).replace(".", ",");

        $("#metodoPagamentoResumo").html(`
      <div class="col-12 pagamento-resumo">
        <div class="img-map">
        <i class="fas fa-money-bill"></i>
    </div>
    <div class="dados-produto">
        <p class="texto-endereco">
            <b>Dinheiro, ${
              troco !== valorTotal
                ? `troco para R$ ${trocoFormatado}.`
                : "sem troco."
            }</b>
        </p>
    </div>
    </div>
        `);
      } else if (metodoPagamento === "pix") {
        $("#metodoPagamentoResumo").html(`
      <div class="col-12 pagamento-resumo">
        <div class="img-map">
        <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16"
                                viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.-->
                                <path
                                    d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 372.6 391.5 392.6 391.5H407.7L310.6 488.6C280.3 518.1 231.1 518.1 200.8 488.6L103.3 391.2H112.6C132.6 391.2 151.5 383.4 165.7 369.2L242.4 292.5zM262.5 218.9C256.1 224.4 247.9 224.5 242.4 218.9L165.7 142.2C151.5 127.1 132.6 120.2 112.6 120.2H103.3L200.7 22.8C231.1-7.6 280.3-7.6 310.6 22.8L407.8 119.9H392.6C372.6 119.9 353.7 127.7 339.5 141.9L262.5 218.9zM112.6 142.7C126.4 142.7 139.1 148.3 149.7 158.1L226.4 234.8C233.6 241.1 243 245.6 252.5 245.6C261.9 245.6 271.3 241.1 278.5 234.8L355.5 157.8C365.3 148.1 378.8 142.5 392.6 142.5H430.3L488.6 200.8C518.9 231.1 518.9 280.3 488.6 310.6L430.3 368.9H392.6C378.8 368.9 365.3 363.3 355.5 353.5L278.5 276.5C264.6 262.6 240.3 262.6 226.4 276.6L149.7 353.2C139.1 363 126.4 368.6 112.6 368.6H80.8L22.8 310.6C-7.6 280.3-7.6 231.1 22.8 200.8L80.8 142.7H112.6z" />
                            </svg>
    </div>
    <div class="dados-produto">
        <p class="texto-endereco">
            <b>Pix</b>
        </p>
    </div>
    </div>
        `);
      } else if (metodoPagamento === "cartao") {
        $("#metodoPagamentoResumo").html(`
      <div class="col-12 pagamento-resumo">
        <div class="img-map">
        <i class="fas fa-credit-card"></i>
    </div>
    <div class="dados-produto">
        <p class="texto-endereco">
            <b>Cartão</b>
        </p>
    </div>
    </div>
        `);
      }
    }

    cardapio.metodos.finalizarPedido();
  },

  // Atualiza o link do botão do WhatsApp
  finalizarPedido: () => {
    if (MEU_CARRINHO.length > 0) {
      var cpf = $("#cpfCliente").val().trim();

      var texto = "Olá! gostaria de fazer um pedido:\n";
      texto += `\n*Itens do pedido:*\n\n\${itens}`;

      if (observacao) {
        texto += `\n*Observação:* _${observacao}_\n`;
      }

      if (tipoDoPedido === "entrega") {
        texto += "\n*Endereço de entrega:*";
        texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
        texto += `\n${MEU_ENDERECO.cidade} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}\n`;

        if (metodoPagamento === "dinheiro") {
          const trocoFormatado = Number(troco).toFixed(2).replace(".", ",");

          texto += `\n*Método de pagamento: Dinheiro, ${
            troco !== valorTotal
              ? `troco para R$ ${trocoFormatado}.`
              : "sem troco."
          }*\n`;
        } else if (metodoPagamento === "pix") {
          texto += `\n*Método de pagamento: Pix*`;
        } else if (metodoPagamento === "cartao") {
          texto += `\n*Método de pagamento: Cartão*\n`;
        }
      } else if (tipoDoPedido === "reserva") {
        texto += "\n*Reserva:*";
        texto += `\nNome: _${nomeDoCliente}_`;
        texto += `\nHorário: _${horario}_`;
        texto += `\nQuantidade de pessoas: _${totalPessoas}_\n`;
      } else if (tipoDoPedido === "busca") {
        texto += `\n*Retirada no local:*`;
        texto += `\nNome: _${nomeDoCliente}_`;
        texto += `\nHorário desejado: _${horario}_\n`;
      }

      const valorDaEntrega = tipoDoPedido === "entrega" ? 0 : VALOR_ENTREGA;

      if (cpf) {
        texto += `\n*CPF na nota*: ${cpf}`;
      }

      texto += `\n*Total${
        tipoDoPedido !== "entrega" ? "" : " (com entrega)"
      }: R$ ${(VALOR_CARRINHO + valorDaEntrega).toFixed(2).replace(".", ",")}*`;

      var itens = "";

      $.each(MEU_CARRINHO, (i, e) => {
        itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price
          .toFixed(2)
          .replace(".", ",")} \n`;

        // último item
        if (i + 1 == MEU_CARRINHO.length) {
          texto = texto.replace(/\${itens}/g, itens);

          // converte a URL
          let encode = encodeURIComponent(texto);
          let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

          $("#btnEtapaResumo").attr("href", URL);
        }
      });
    }
  },

  // carrega o link do botão reserva
  carregarBotaoReserva: () => {
    var texto = "Olá! gostaria de fazer uma *reserva*";

    let encode = encodeURIComponent(texto);
    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

    $("#btnReserva").attr("href", URL);
  },

  // carrega o botão de ligar
  carregarBotaoLigar: () => {
    $("#btnLigar").attr("href", `tel:${CELULAR_EMPRESA}`);
  },

  // abre o depoimento
  abrirDepoimento: (depoimento) => {
    $("#depoimento-1").addClass("hidden");
    $("#depoimento-2").addClass("hidden");
    $("#depoimento-3").addClass("hidden");

    $("#btnDepoimento-1").removeClass("active");
    $("#btnDepoimento-2").removeClass("active");
    $("#btnDepoimento-3").removeClass("active");

    $("#depoimento-" + depoimento).removeClass("hidden");
    $("#btnDepoimento-" + depoimento).addClass("active");
  },

  alterarMetodoPagamento: (metodoPagamentoSelecionado) => {
    metodosButtons.forEach((button) => {
      if (
        button.getAttribute("data-js") ===
        `metodo-${metodoPagamentoSelecionado}`
      ) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });

    if (metodoPagamentoSelecionado === "dinheiro") {
      $("#trocoContainer").removeClass("hidden");
      $("#troco").focus();
    } else {
      $("#trocoContainer").addClass("hidden");
    }

    metodoPagamento = metodoPagamentoSelecionado;
  },

  // mensagens
  mensagem: (texto, cor = "red", tempo = 3500) => {
    let id = Math.floor(Date.now() * Math.random()).toString();

    let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;

    $("#container-mensagens").append(msg);

    setTimeout(() => {
      $("#msg-" + id).removeClass("fadeInDown");
      $("#msg-" + id).addClass("fadeOutUp");
      setTimeout(() => {
        $("#msg-" + id).remove();
      }, 800);
    }, tempo);
  },
};

cardapio.templates = {
  item: `
        <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
            <div class="card card-item" id="\${id}">
                <div class="img-produto">
                    <img src="\${img}" />
                </div>
                <p class="title-produto text-center mt-4">
                    <b>\${nome}</b>
                </p>
                <p class="price-produto text-center">
                    <b>R$ \${preco}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-\${id}">0</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                </div>
            </div>
        </div>
    `,

  itemCarrinho: `
        <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}" />
            </div>
            <div class="dados-produto">
                <p class="title-produto"><b>\${nome}</b></p>
                <p class="price-produto"><b>R$ \${preco}</b></p>
            </div>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
            </div>
        </div>
    `,

  itemResumo: `
        <div class="col-12 item-carrinho resumo">
            <div class="img-produto-resumo">
                <img src="\${img}" />
            </div>
            <div class="dados-produto">
                <p class="title-produto-resumo">
                    <b>\${nome}</b>
                </p>
                <p class="price-produto-resumo">
                    <b>R$ \${preco}</b>
                </p>
            </div>
            <p class="quantidade-produto-resumo">
                x <b>\${qntd}</b>
            </p>
        </div>
    `,
};
