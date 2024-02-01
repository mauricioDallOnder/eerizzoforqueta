import React, { useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  TextField, Button, Box, Autocomplete, Container,
} from "@mui/material";

import { DataContext } from "@/context/context";
import {
 Modalidade, Turma
} from "@/interface/interfaces";
import { BoxStyleCadastro} from "@/utils/Styles";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { HeaderForm } from "@/components/HeaderDefaultForm";
import Layout from "@/components/TopBarComponents/Layout";

interface MoveStudentFormData {
  alunoNome: string;
  modalidadeOrigem: string;
  nomeDaTurmaOrigem: string;
  modalidadeDestino: string;
  nomeDaTurmaDestino: string;
}

interface AlunoAutocompleteOption {
  id: string;
  nome: string;
  modalidade: string;
  turma: string;
  nucleo: string;
}

export default function MoveStudentForm() {
  const { moveStudentInApi, modalidades } = useContext(DataContext);
  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting, errors } } = useForm<MoveStudentFormData>();
  
  const [alunosOptions, setAlunosOptions] = useState<AlunoAutocompleteOption[]>([]);
  const [turmasDestinoOptions, setTurmasDestinoOptions] = useState<Turma[]>([]);
  const [modalidadesOptions, setModalidadesOptions] = useState<Modalidade[]>([]);

  useEffect(() => {
    setModalidadesOptions(modalidades);
  }, [modalidades]);

  useEffect(() => {
    const alunosExtraidos = modalidades.flatMap((modalidade, modalidadeIndex) =>
      modalidade.turmas.flatMap((turma, turmaIndex) =>
        (turma.alunos ?? []).map((aluno, alunoIndex) => ({
          id: `aluno-${modalidadeIndex}-${turmaIndex}-${alunoIndex}`,
          nome: aluno?.nome,
          modalidade: modalidade.nome,
          turma: turma.nome_da_turma,
          nucleo: turma.nucleo,
        }))
      )
    ).filter(option => option.nome !== undefined);
    setAlunosOptions(alunosExtraidos);
  }, [modalidades]);

  useEffect(() => {
    const modalidadeSelecionada = modalidades.find(
      mod => mod.nome === watch("modalidadeDestino")
    );
    setTurmasDestinoOptions(modalidadeSelecionada?.turmas || []);
  }, [watch("modalidadeDestino"), modalidades]);

  const handleAlunoChange = (_event: any, value: AlunoAutocompleteOption | null) => {
    if (value) {
      setValue("alunoNome", value.nome);
      setValue("modalidadeOrigem", value.modalidade);
      setValue("nomeDaTurmaOrigem", value.turma);
      setValue("modalidadeDestino", "");
      setValue("nomeDaTurmaDestino", "");
    }
  };

  const onSubmit: SubmitHandler<MoveStudentFormData> = async (data) => {
    try {
      await moveStudentInApi(data);
      alert("Cadastro atualizado com sucesso");
      reset();
    } catch (error) {
      console.error("Erro ao enviar os dados do formulário", error);
    }
  };

  return (
    <Layout>
    <Container>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={BoxStyleCadastro}
      >
        <HeaderForm titulo={"Mudança de Turma"}/>
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
            <li {...props} key={option.id}>
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

        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Enviando dados,aguarde..." : "Mover Aluno"}
        </Button>
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