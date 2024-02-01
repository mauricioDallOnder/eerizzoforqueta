export const fieldsIdentificacao = [
  { label: "Nome Completo do Aluno(a)", id: "aluno.nome" },
  { label: "Data de Nascimento do Aluno(a)", id: "aluno.anoNascimento" },
  { label: "Número de Telefone com WhatsApp", id: "aluno.telefoneComWhatsapp" },
  {
    label: "Número do RG (ou Certidão de Nascimento, temporariamente).",
    id: "aluno.informacoesAdicionais.rg",
  },
];
export const fieldsEndereco = [
  { label: "Rua/Avenida", id: "aluno.informacoesAdicionais.endereco.ruaAvenida" },
  {
    label: "Nº da Residência:",
    id: "aluno.informacoesAdicionais.endereco.numeroResidencia",
  },
  { label: "Bairro", id: "aluno.informacoesAdicionais.endereco.bairro" },
  { label: "CEP", id: "aluno.informacoesAdicionais.endereco.cep" },
  {
    label: "Complemento",
    id: "aluno.informacoesAdicionais.endereco.complemento",
  },
];
//pagadorMensalidades
export const fieldsResponsavelMensalidade = [
  {
    label: "Nome completo",
    id: "aluno.informacoesAdicionais.pagadorMensalidades.nomeCompleto",
  },
  { label: "CPF", id: "aluno.informacoesAdicionais.pagadorMensalidades.cpf" },
  {
    label: "Endereço de E-mail do Responsável",
    id: "aluno.informacoesAdicionais.pagadorMensalidades.email",
  },
  {
    label: "Telefone para emergências",
    id: "aluno.informacoesAdicionais.pagadorMensalidades.celularWhatsapp",
  },
];

//Informe se possui irmão(s) que também treinam conosco e seus nomes.

export const fieldsDadosGeraisAtleta = [
  {
    label: "Escola em que o Aluno(a) estuda atualmente",
    id: "aluno.informacoesAdicionais.escolaEstuda",
  },
  { label: "Informe se possui irmão(s) que também treinam conosco e seus nomes.", id: "aluno.informacoesAdicionais.irmaos" },
  {
    label: "Possui algum problema de saúde? ",
    id: "aluno.informacoesAdicionais.saude",
  },
  {
    label: "Caso possua problema de saúde, descreva-os abaixo: ",
    id: "aluno.informacoesAdicionais.problemasaude",
  },
  { label: "Faz uso de algum tipo de medicação?: ", id: "medicacao" },
  {
    label: "Quais medicações faz uso?",
    id: "aluno.informacoesAdicionais.tipomedicacao",
  },
  {
    label: "Em qual convênio de saúde seu filho(a) é atendido?",
    id: "aluno.informacoesAdicionais.convenio",
  },
  {
    label:
      "Você autoriza seu o aluno a participar de competições?",
    id: "aluno.informacoesAdicionais.competicao",
  },
 
 
];
export const vinculosempresasparceiras = [
  {
    label: "O aluno(a) é filho(a) de funcionário(a) da JBS?",
    id: "aluno.informacoesAdicionais.filhofuncionarioJBS",
  },
  {
    label: "O responsável é sócio da sede da JBS?",
    id: "aluno.informacoesAdicionais.socioJBS",
  },
  {
    label: "Nome do Funcionário(a) da JBS (Pai/Mãe do Aluno):",
    id: "aluno.informacoesAdicionais.nomefuncionarioJBS",
  },
  {
    label: "O aluno(a) é filho(a) de funcionário(a) da Marcopolo?",
    id: "aluno.informacoesAdicionais.filhofuncionariomarcopolo",
  },
  {
    label: "Nome do Funcionário(a) da Marcopolo (Pai/Mãe do Aluno):",
    id: "aluno.informacoesAdicionais.nomefuncionariomarcopolo",
  }
];

export const fieldsUniforme = [
  {
    label:
      "Uniforme Obrigatório: R$ 110,00 para futsal e vôlei masculino (calção, camiseta e meia), R$ 150,00 para vôlei feminino (short, camiseta e meia). Pagamento à vista ou parcelado em 1+2 vezes. Por favor, informe o tamanho do uniforme do seu filho(a) abaixo:",
    id: "aluno.informacoesAdicionais.uniforme",
  },
];
export const fieldsUsoImagem = [
  {
    label:
      "Você autoriza o uso da imagem e nome deste para fins legítimos de divulgação e promoção da marca, sem ônus?",
      id: "aluno.informacoesAdicionais.imagem",
  },
];


//
export const fieldsTermosAvisos = [
  {
    label:
      "A cobrança da mensalidade será interrompida somente após o comunicado formal de cancelamento da matrícula, que deve ser realizado até o dia 28 do mês corrente para evitar cobranças no mês seguinte.",
    id: "aluno.informacoesAdicionais.cobramensalidade",
  },
  {
    label:
      "Você se compromete a avisar antecipadamente a ausência de seu filho aos treinos, bem como a informar sobre possíveis problemas de saúde?",
    id: "aluno.informacoesAdicionais.avisaAusencia",
  },
  {
    label:
      "Comprometo-me a pagar a mensalidade dos treinos até o dia 10 de cada mês e, em caso de cancelamento, a comunicar até o dia 28 do mês corrente para evitar cobranças futuras.",
    id: "aluno.informacoesAdicionais.comprometimentoMensalidade",
  },
  {
    label:
      "Concordo com: desconto de R$ 5,00 seja dado SOMENTE para pagamentos até dia 10, independentemente do dia da semana; não devolução ou isenção de pagamento de mensalidades ou valores parciais correspondentes a treinos não realizados, exceto em situações em que o afastamento for justificado por atestado médico; em caso de faltas, o aluno terá o direito a recuperar o treino perdido. Treinos que coincidam com dias de feriado não serão recuperados.",
    id: "aluno.informacoesAdicionais.desconto",
  },
  {
    label:
      "Você declara que o pré-mencionado menor está em perfeitas condições de saúde, podendo participar de treinos e competições?",
    id: "aluno.informacoesAdicionais.condicaosaude",
  },
];

type OpcoesTermosAvisos = {
  [key: string]: string[];
};

export const opcoesTermosAvisos: OpcoesTermosAvisos = {
  cobramensalidade: ["Ciente"],
  avisaAusencia: ["Sim, avisarei sobre ausências aos treinos."],
  comprometimentoMensalidade: [
    "Concordo em realizar o pagamento antecipado até dia 10 de cada mês.",
  ],
  copiaDocumento: [
    "Comprometo-me a providenciar cópia autenticada do RG e atestado médico.",
  ],
  desconto: ["Estou de acordo com o desconto"],
  condicaosaude: ["Sim, declaro."],
};

//----------------------------------------------------------------------------------------------

type DiasDaSemanaMap = {
  [key: string]: number;
};

export type Presencas = {
  [mes: string]: {
    [data: string]: boolean;
  };
};

export function extrairDiaDaSemana(nomeDaTurma: string): string {
  const partes = nomeDaTurma.split("_");
  return (
    partes.find((parte) =>
      [
        "SEGUNDA",
        "TERCA",
        "QUARTA",
        "QUINTA",
        "SEXTA",
        "SABADO",
        "DOMINGO",
      ].includes(parte.toUpperCase())
    ) || "SEGUNDA"
  );
}

export function gerarPresencasParaAluno(diaDaSemana: string): Presencas {
  const ano = 2024;
  const diasDaSemana: DiasDaSemanaMap = {
    SEGUNDA: 1,
    TERCA: 2,
    QUARTA: 3,
    QUINTA: 4,
    SEXTA: 5,
    SABADO: 6,
    DOMINGO: 0,
  };

  let presencas: Presencas = {};
  for (let mes = 0; mes < 12; mes++) {
    let nomeMes = new Date(ano, mes, 1).toLocaleString("pt-BR", {
      month: "long",
    });
    presencas[nomeMes] = {};
    let dias = gerarDiasDoMes(
      ano,
      mes,
      diasDaSemana[diaDaSemana.toUpperCase()]
    );
    dias.forEach((data) => {
      presencas[nomeMes][data] = false;
    });
  }

  return presencas;
}

export function gerarDiasDoMes(
  ano: number,
  mes: number,
  diaDaSemana: number
): string[] {
  let datas: string[] = [];
  let data = new Date(ano, mes, 1);
  while (data.getDay() !== diaDaSemana) {
    data.setDate(data.getDate() + 1);
  }
  while (data.getMonth() === mes) {
    let diaFormatado = `${data.getDate()}-${mes + 1}-${ano}`;
    datas.push(diaFormatado);
    data.setDate(data.getDate() + 7);
  }
  return datas;
}
