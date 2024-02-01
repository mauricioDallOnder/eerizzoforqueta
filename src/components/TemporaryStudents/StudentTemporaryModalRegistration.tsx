import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  MenuItem,

  Paper,
} from "@mui/material";
import {
  TituloSecaoStyle,
  modalStyleTemporaly,
} from "@/utils/Styles";
import { extrairDiaDaSemana, gerarPresencasParaAluno } from "@/utils/Constants";
import { useData } from "@/context/context";
import {
  FormValuesStudent,
  Turma,
} from "@/interface/interfaces";

interface TemporaryStudentRegistrationProps {
  handleCloseModal: () => void;
}

export default function TemporaryStudentRegistration({
  handleCloseModal,
}: TemporaryStudentRegistrationProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValuesStudent>();
  const { modalidades, fetchModalidades, sendDataToApi } = useData(); // Usando o hook useData
  const [selectedNucleo, setSelectedNucleo] = useState<string>("");
  const [nucleosDisponiveis, setNucleosDisponiveis] = useState<string[]>([]);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<Turma[]>([]);

  const selectedModalidade = watch("modalidade");
  //const selectedTurma = watch('turmaSelecionada');

  useEffect(() => {
    fetchModalidades();
  }, [fetchModalidades]);

  const onSubmit: SubmitHandler<FormValuesStudent> = async (data) => {
    const diaDaSemana = extrairDiaDaSemana(data.turmaSelecionada);
    data.aluno.presencas = gerarPresencasParaAluno(diaDaSemana);

    const turmaEscolhida = modalidades
      .find((m) => m.nome === data.modalidade)
      ?.turmas.find((t) => t.nome_da_turma === data.turmaSelecionada);

    if (
      turmaEscolhida &&
      turmaEscolhida.capacidade_atual_da_turma <
        turmaEscolhida.capacidade_maxima_da_turma
    ) {
      try {
        await sendDataToApi(data);
        alert("Cadastro efetuado com sucesso");
        reset(); // Resetando o formulário após o envio
      } catch (error) {
        console.error("Erro ao enviar os dados do formulário", error);
      }
    } else {
      alert("A turma selecionada não possui mais vagas disponíveis.");
    }
  };

  const getNucleosForModalidade = (modalidade: string) => {
    const turmas = modalidades.find((m) => m.nome === modalidade)?.turmas;
    if (!turmas) return [];
    const nucleos = new Set(turmas.map((turma) => turma.nucleo));
    return Array.from(nucleos);
  };

  useEffect(() => {
    const nucleos = getNucleosForModalidade(selectedModalidade);
    setNucleosDisponiveis(nucleos);
    setSelectedNucleo("");
  }, [selectedModalidade]);

  useEffect(() => {
    const turmasFiltradas = modalidades
      .find((m) => m.nome === selectedModalidade)
      ?.turmas.filter((turma) => turma.nucleo === selectedNucleo);
    setTurmasDisponiveis(turmasFiltradas || []);
  }, [selectedNucleo, modalidades, selectedModalidade]);

  return (
    <Container>
      <Paper sx={modalStyleTemporaly}>
        <form onSubmit={handleSubmit(onSubmit)}>
          
            <Typography sx={TituloSecaoStyle}>
              Cadastro de Alunos Temporários
            </Typography>
            <Grid
              container
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do Aluno"
                  variant="standard"
                  required
                  {...register("aluno.nome")}
                />
              </Grid>
              {/* Restante dos campos do formulário */}
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  required
                  label="Modalidade"
                  {...register("modalidade")}
                  fullWidth
                  variant="outlined"
                  sx={{ marginBottom: 2 }}
                >
                  {modalidades
                    .filter(
                      (modalidade) =>
                        modalidade.nome !== "futebol" &&
                        modalidade.nome !== "volei" &&
                        modalidade.nome !== "futsal" &&
                        modalidade.nome !== "arquivados" &&
                        modalidade.nome !== "excluidos"
                    )
                    .map((modalidade) => (
                      <MenuItem key={modalidade.nome} value={modalidade.nome}>
                        {modalidade.nome}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Local de treinamento"
                  value={selectedNucleo ? selectedNucleo : ""}
                  onChange={(event) =>
                    setSelectedNucleo(event.target.value as string)
                  }
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ marginBottom: 2 }}
                >
                  {nucleosDisponiveis.map((nucleo) => (
                    <MenuItem key={nucleo} value={nucleo}>
                      {nucleo}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Turma"
                  {...register("turmaSelecionada")}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ marginBottom: 2 }}
                >
                  {turmasDisponiveis.map((turma) => (
                    <MenuItem
                      key={turma.nome_da_turma}
                      value={turma.nome_da_turma}
                    >
                      {turma.nome_da_turma}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {/* Botões */}
              <Grid item xs={12} sm={6}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  fullWidth
                >
                  Cadastrar aluno
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCloseModal}
                  fullWidth
                >
                  Fechar Cadastro
                </Button>
              </Grid>
            </Grid>
         
        </form>
      </Paper>
    </Container>
  );
}
