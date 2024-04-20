import React, { useCallback, useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { TextField, Button, Box, Autocomplete, Container, Typography } from "@mui/material";
import { DataContext } from "@/context/context";
import { Modalidade, Turma, AlunoAutocompleteOption, MoveStudentsPayload } from "@/interface/interfaces";
import { BoxStyleCadastro } from "@/utils/Styles";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { HeaderForm } from "@/components/HeaderDefaultForm";
import Layout from "@/components/TopBarComponents/Layout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
export default function MoveStudentForm() {
  const { moveStudentInApi, modalidades, fetchModalidades } = useContext(DataContext);
  const { register, handleSubmit, setValue, watch, reset, control, formState: { isSubmitting, errors } } = useForm<MoveStudentsPayload>();
  const [selectedAlunos, setSelectedAlunos] = useState<AlunoAutocompleteOption[]>([]);
  const [alunosOptions, setAlunosOptions] = useState<AlunoAutocompleteOption[]>([]);
  const [turmasDestinoOptions, setTurmasDestinoOptions] = useState<Turma[]>([]);
  const [modalidadesOptions, setModalidadesOptions] = useState<Modalidade[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    fetchModalidades().catch(console.error);
  }, [fetchModalidades]);

  useEffect(() => {
    setModalidadesOptions(modalidades);
  }, [modalidades]);

  useEffect(() => {
    const alunosExtraidos = modalidades.flatMap(modalidade =>
      modalidade.turmas.flatMap(turma =>
        (turma.alunos || []).filter(aluno => turma.nome_da_turma !== "excluidos").map(aluno => ({
          id: aluno?.informacoesAdicionais?.IdentificadorUnico!,
          nome: aluno?.nome ?? "",
          modalidade: modalidade.nome,
          turma: turma.nome_da_turma,
          nucleo: turma.nucleo,
          key: `${aluno?.informacoesAdicionais?.IdentificadorUnico}-${modalidade.nome}-${turma.nome_da_turma}` // chave composta
        }))
      )
    );
    setAlunosOptions(alunosExtraidos);
  }, [modalidades]);

  async function corrigirDados() {
    try {
      const response = await axios.post('/api/AjustarDadosTurma');
      console.log('Dados da turma corrigidos com sucesso.');
    } catch (error) {
      console.error('Erro ao corrigir dados da turma.');
    }
  }


  useEffect(() => {
    const modalidadeSelecionada = modalidades.find(mod => mod.nome === watch("modalidadeDestino"));
    setTurmasDestinoOptions(modalidadeSelecionada?.turmas || []);
  }, [watch("modalidadeDestino"), modalidades]);

  useEffect(() => {
    const turmasOrigem = selectedAlunos.map(a => a.turma);
    setValue("alunosTurmasOrigem", turmasOrigem); // Define o valor do campo com as turmas de origem como um array
  }, [selectedAlunos, setValue]);

  const handleAlunoSelectionChange = (_event: React.ChangeEvent<{}>, value: AlunoAutocompleteOption[]) => {
    setSelectedAlunos(value);
    setValue("alunosNomes", value.map(v => v.nome));
    setValue("alunosTurmasOrigem", value.map(v => v.turma)); // Atualizar o campo com as turmas de origem
  };


  const onSubmit: SubmitHandler<MoveStudentsPayload> = useCallback(async () => {
    setIsProcessing(true);
    const payload: MoveStudentsPayload = {
      alunosNomes: selectedAlunos.map(a => a.nome),
      alunosModalidadesOrigem: selectedAlunos.map(a => a.modalidade),
      alunosTurmasOrigem: selectedAlunos.map(a => a.turma),
      modalidadeDestino: watch('modalidadeDestino'),
      nomeDaTurmaDestino: watch('nomeDaTurmaDestino'),
    };

    console.log("Payload a ser enviado:", payload); // Verifique o que está sendo enviado
    await moveStudentInApi(payload);
    await corrigirDados()
    alert("Alunos movidos com sucesso.");
    reset();
    setIsProcessing(false);
  }, [moveStudentInApi, reset, selectedAlunos, watch]);






  return (
    <Layout>
      <Container>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={BoxStyleCadastro}
        >
          <HeaderForm titulo={"Mudança de Turma de Alunos"} />
          <Autocomplete
            multiple
            options={alunosOptions}
            getOptionLabel={(option) => option.nome} // Continua exibindo o nome
            onChange={handleAlunoSelectionChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Selecione os Alunos"
                margin="normal"
                required
                fullWidth
                error={!!errors.alunosNomes}
                helperText={errors.alunosNomes?.message}
              />
            )}
            renderOption={(props, option) => {
              // Use uma chave única concatenando o ID do aluno com o nome. Se o ID estiver faltando, você pode usar um fallback como um UUID ou índice.
              const key = uuidv4() + option.alunoId;
              return (
                <li {...props} key={key}>
                  {option.nome}
                </li>
              );
            }}

          />

          <TextField
            margin="normal"
            fullWidth
            label="Turmas de Origem"
            value={selectedAlunos.map(a => a.turma).join(", ")}  // Usar o valor diretamente para exibição
            InputLabelProps={{
              shrink: true,
            }}
            disabled={true}  // Campo apenas para leitura
            helperText="Turmas de origem dos alunos selecionados"
          />



          <Autocomplete
            options={modalidadesOptions}
            getOptionLabel={(option) => option.nome}
            onChange={(_, newValue) => {
              setValue("modalidadeDestino", newValue?.nome ?? "");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                {...register("modalidadeDestino")}
                label="Modalidade de Destino"
                margin="normal"
                required
                fullWidth
                error={!!errors.modalidadeDestino}
                helperText={errors.modalidadeDestino?.message || "Selecione a modalidade de destino"}
              />
            )}
          />

          <Autocomplete
            options={turmasDestinoOptions}
            getOptionLabel={(option) => option.nome_da_turma}
            onChange={(_, newValue) => {
              setValue("nomeDaTurmaDestino", newValue?.nome_da_turma ?? "");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                {...register("nomeDaTurmaDestino")}
                label="Nome da Turma de Destino"
                margin="normal"
                required
                fullWidth
                error={!!errors.nomeDaTurmaDestino}
                helperText={errors.nomeDaTurmaDestino?.message || "Selecione a turma de destino"}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || isProcessing}
          >
            {isSubmitting || isProcessing ? "Movendo aluno e atualizando turmas... aguarde" : "Mover Alunos"}
          </Button>
        </Box>
      </Container>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || session.user.role !== "admin") {
    return {
      redirect: {
        destination: "/NotAllowPage",
        permanent: false,
      },
    };
  }

  return { props: {} };
};
