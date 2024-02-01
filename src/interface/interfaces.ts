
// Definindo interfaces para os tipos de dados
interface Endereco {
  ruaAvenida: string;
  numeroResidencia: number | string;
  bairro: string;
  cep: number | string;
  complemento: string;
}

interface PagadorMensalidades {
  nomeCompleto: string;
  cpf: number | string;
  email: string;
  celularWhatsapp: number | string;
}

export interface InformacoesAdicionais {
  endereco: Endereco;
  pagadorMensalidades: PagadorMensalidades;
  cobramensalidade: string;
  escolaEstuda: string;
  irmaos: string;
  saude: string;
  problemasaude: string;
  medicacao: string;
  tipomedicacao: string;
  convenio: string;
  nucleoTreinamento: string;
  modalidadesPraticadas: string[];
  competicao: string;
  comprometimentoMensalidade: string;
  copiaDocumento: string;
  imagem: string;
  avisaAusencia: string;
  desconto: string;
  rg:string;
  filhofuncionarioJBS:string;
  socioJBS:string;
  nomefuncionarioJBS:string;
  filhofuncionariomarcopolo:string
  nomefuncionariomarcopolo:string
  uniforme:string
}

export interface Aluno {
  id:number;
  informacoesAdicionais: InformacoesAdicionais;
  nome: string;
  anoNascimento: string;
  telefoneComWhatsapp: number | string;
  presencas: Record<string, Record<string, boolean>>;
}

export interface Turma {
  nome_da_turma: string;
  modalidade: string;
  nucleo: string;
  categoria: string;
  capacidade_maxima_da_turma: number;
  capacidade_atual_da_turma: number;
  alunos: Aluno[];
}

export interface Modalidade {
  nome: string; // identificador da modalidade, como "futebol", "vôlei", etc.
  turmas: Turma[];
}
export interface AlunoPresencaUpdate extends Aluno {
  modalidade: string;
  nomeDaTurma: string;
  alunoId: string;
}

export interface MoveStudentPayload {
  alunoNome: string;
  modalidadeOrigem: string;
  nomeDaTurmaOrigem: string;
  modalidadeDestino: string;
  nomeDaTurmaDestino: string;
}

export interface StudentPresenceTableProps {
  alunosDaTurma: Aluno[];
  setAlunosDaTurma: React.Dispatch<React.SetStateAction<Aluno[]>>;
  modalidade: string;
  nomeDaTurma: string;
  alunoId?:number;
}

export interface AdminTableProps{
  alunosDaTurma: Aluno[];
  modalidades?: Modalidade[];
  nomeDaTurma:string
}

// Tipagem para as props da página
export interface AdminPageProps {
  modalidades: Modalidade[];
}

export type FormValuesStudent = {
  aluno: AlunoPresencaUpdate;
  modalidade: string; // nome da modalidade selecionada
  turmaSelecionada: string; // nome da turma selecionada
  nucleoSelecionado: string; // nome do núcleo selecionado
};


export interface ModalidadesData {
  [key: string]: { turmas: Turma[] };
}


export interface AttendanceModalContentProps {
  aluno: Aluno;
  month: string;
}


export interface IIAlunoUpdate extends Aluno {
  modalidade: string; // A modalidade do aluno
  nomeDaTurma: string; // O nome da turma do aluno
  alunoId?: string | number; // O ID do aluno
  anoNascimento: string; // A data de nascimento a serem atualizada
  telefoneComWhatsapp: string| number;
  nome: string;
  informacoesAdicionais: InformacoesAdicionais
}