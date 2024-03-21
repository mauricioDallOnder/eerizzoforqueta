import React, { useCallback, useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { TextField, Button, Box, Autocomplete, Container, Typography } from "@mui/material";

import { DataContext } from "@/context/context";
import { Modalidade, Turma } from "@/interface/interfaces";
import { BoxStyleCadastro } from "@/utils/Styles";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { HeaderForm } from "@/components/HeaderDefaultForm";
import Layout from "@/components/TopBarComponents/Layout";
import axios from "axios";
interface MoveStudentFormData {
  alunoNome: string;
  modalidadeOrigem: string;
  nomeDaTurmaOrigem: string;
  modalidadeDestino: string;
  nomeDaTurmaDestino: string;
}

interface AlunoAutocompleteOption {
  id: string | number;
  nome: string;
  modalidade: string;
  turma: string;
  nucleo: string;
}

export default function MoveStudentForm() {
  const { moveStudentInApi, modalidades, fetchModalidades } = useContext(DataContext);
  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting, errors } } = useForm<MoveStudentFormData>();

  const [alunosOptions, setAlunosOptions] = useState<AlunoAutocompleteOption[]>([]);
  const [turmasDestinoOptions, setTurmasDestinoOptions] = useState<Turma[]>([]);
  const [modalidadesOptions, setModalidadesOptions] = useState<Modalidade[]>([]);
  const turmaOrigem = alunosOptions.find(a => a.nome === watch("alunoNome"))?.turma;
  // Encontre a turma correspondente para obter a quantidade de alunos
  const quantidadeAlunosTurmaOrigem = modalidades.flatMap(m => m.turmas)
    .find(t => t.nome_da_turma === turmaOrigem)?.capacidade_atual_da_turma

   
  useEffect(() => {
    fetchModalidades().catch(console.error);
  }, [fetchModalidades]);

  useEffect(() => {
    setModalidadesOptions(modalidades);
  }, [modalidades]);



  useEffect(() => {
    const alunosExtraidos = modalidades
      .filter(modalidade => Array.isArray(modalidade.turmas)) // Garante que só processa modalidades com turmas sendo array
      .flatMap(modalidade =>
        modalidade.turmas.flatMap(turma => {
          // Garante que turma.alunos é um array antes de tentar filtrar
          const alunosArray = Array.isArray(turma.alunos) ? turma.alunos : [];
          return alunosArray.filter(Boolean).map(aluno => ({
            id: aluno.id,
            nome: aluno.nome,
            modalidade: modalidade.nome,
            turma: turma.nome_da_turma,
            nucleo: turma.nucleo,
          }));
        })
      );
    setAlunosOptions(alunosExtraidos);
  }, [modalidades]);
  


  useEffect(() => {
    const modalidadeSelecionada = modalidades.find(
      mod => mod.nome === watch("modalidadeDestino")
    );
    setTurmasDestinoOptions(modalidadeSelecionada?.turmas || []);
  }, [watch("modalidadeDestino"), modalidades]);

  const handleAlunoChange = useCallback((_event: any, value: AlunoAutocompleteOption | null) => {
    if (value) {
      setValue("alunoNome", value.nome);
      setValue("modalidadeOrigem", value.modalidade);
      setValue("nomeDaTurmaOrigem", value.turma);
      setValue("modalidadeDestino", "");
      setValue("nomeDaTurmaDestino", "");
    }
    
  }, [setValue]);

  const onSubmit: SubmitHandler<MoveStudentFormData> = useCallback(async (data) => {
    try {
      await moveStudentInApi(data);
     
      alert("Aluno movido com sucesso.");
      reset();
    } catch (error) {
      console.error("Erro ao mover aluno", error);
    }
  }, [moveStudentInApi, reset]);

 

  return (
    <Layout>
      <Container>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={BoxStyleCadastro}
        >
          <HeaderForm titulo={"Mudança de Turma"} />
          <Autocomplete
            options={alunosOptions}
            getOptionLabel={(option) => option.nome}
            onChange={handleAlunoChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Nome do Aluno"
                margin="normal"
                required
                fullWidth
                error={!!errors.alunoNome}
                helperText={errors.alunoNome?.message}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={`${props.id}-${option}`}>
                {option.nome}
              </li>
            )}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Modalidade de Origem"
            {...register("modalidadeOrigem", {
              required: "Modalidade de origem é obrigatória",
            })}
            InputLabelProps={{
              shrink: true,
            }}
            error={!!errors.modalidadeOrigem}
            helperText={errors.modalidadeOrigem?.message}
            disabled
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nome da Turma de Origem"
            {...register("nomeDaTurmaOrigem", {
              required: "Turma de origem é obrigatória",
            })}
            InputLabelProps={{
              shrink: true,
            }}
            disabled
            error={!!errors.nomeDaTurmaOrigem}
            helperText={errors.nomeDaTurmaOrigem?.message}
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
                helperText={
                  errors.modalidadeDestino?.message ||
                  "Selecione a modalidade de destino"
                }
              />
            )}
          />

          {/* Campo Autocomplete para Nome da Turma de Destino */}
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
                helperText={
                  errors.nomeDaTurmaDestino?.message ||
                  "Selecione a turma de destino"
                }
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || quantidadeAlunosTurmaOrigem! <= 1}
          >
            {isSubmitting ? "Enviando dados, aguarde..." : quantidadeAlunosTurmaOrigem! <= 1 ? "A turma de origem deve ter mais de um aluno para permitir a movimentação" : "Mover Aluno"}
          </Button>
          <p style={{color:"black"}}>{quantidadeAlunosTurmaOrigem}</p>
        </Box>
      </Container>
    </Layout>
  );
}


export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // Se não tiver sessão ou não for admin, redirecione para a página de login
  if (!session || session.user.role !== "admin") {
    return {
      redirect: {
        destination: "/NotAllowPage",
        permanent: false,
      },
    };
  }

  // Retornar props aqui se a permissão for válida
  return { props: { /* props adicionais aqui */ } };
};
