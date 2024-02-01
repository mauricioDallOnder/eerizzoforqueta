import React, { useContext, useEffect, useState } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  Box,
  Container,
  Grid,
  List,
  Typography,
} from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { DataContext } from "@/context/context";
import { IIAlunoUpdate } from "@/interface/interfaces";
import { HeaderForm } from "@/components/HeaderDefaultForm";
import Layout from "@/components/TopBarComponents/Layout";
import { BoxStyleCadastro, ListStyle, TituloSecaoStyle } from "@/utils/Styles";

import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

export default function StudentUpdatePersonalInformation() {
  const { updateDataInApi, modalidades } = useContext(DataContext);
  const [selectedAluno, setSelectedAluno] = useState<IIAlunoUpdate | null>(
    null
  );
  const [alunosOptions, setAlunosOptions] = useState<IIAlunoUpdate[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<IIAlunoUpdate>();

  useEffect(() => {
    const newAlunosOptions = modalidades.flatMap((modalidade) =>
      modalidade.turmas.flatMap((turma) =>
        (Array.isArray(turma.alunos) ? turma.alunos : [])
          .filter((aluno) => aluno !== null && aluno !== undefined) // This will remove any null or undefined entries
          .map((aluno) => ({
            ...aluno,
            nome: aluno.nome,
            anoNascimento: aluno.anoNascimento,
            telefoneComWhatsapp: aluno.telefoneComWhatsapp,
            informacoesAdicionais: aluno.informacoesAdicionais,
            nomeDaTurma: turma.nome_da_turma,
            modalidade: modalidade.nome,
          }))
      )
    );
    setAlunosOptions(newAlunosOptions);
  }, [modalidades]);

  const onSubmit: SubmitHandler<IIAlunoUpdate> = async (data) => {
    try {
      await updateDataInApi({
        ...data,
        alunoId: selectedAluno?.id, // Ensure that you include the student's ID here
      });
      alert("Cadastro atualizado com sucesso");
      reset();
    } catch (error) {
      console.error("Erro ao enviar os dados do formulário", error);
    }
  };

  const handleAlunoChange = (_event: any, value: IIAlunoUpdate | null) => {
    setSelectedAluno(value);
    if (value) {
      // Atualiza todos os campos do formulário com as informações do aluno
      setValue("nome", value.nome);
      setValue("anoNascimento", value.anoNascimento);
      setValue("telefoneComWhatsapp", value.telefoneComWhatsapp);
      setValue("telefoneComWhatsapp", value.telefoneComWhatsapp);
      setValue(
        "informacoesAdicionais.rg",
        value.informacoesAdicionais.rg
      );
      setValue(
        "informacoesAdicionais.filhofuncionarioJBS",
        value.informacoesAdicionais.filhofuncionarioJBS
      );
      setValue(
        "informacoesAdicionais.socioJBS",
        value.informacoesAdicionais.socioJBS
      );
      setValue(
        "informacoesAdicionais.nomefuncionarioJBS",
        value.informacoesAdicionais.nomefuncionarioJBS
      );
      setValue(
        "informacoesAdicionais.filhofuncionariomarcopolo",
        value.informacoesAdicionais.filhofuncionariomarcopolo
      );
      setValue(
        "informacoesAdicionais.nomefuncionariomarcopolo",
        value.informacoesAdicionais.nomefuncionariomarcopolo
      );
      setValue(
        "informacoesAdicionais.uniforme",
        value.informacoesAdicionais.uniforme
      );

      setValue(
        "informacoesAdicionais.escolaEstuda",
        value.informacoesAdicionais.escolaEstuda
      );
      setValue(
        "informacoesAdicionais.irmaos",
        value.informacoesAdicionais.irmaos
      );
      setValue(
        "informacoesAdicionais.saude",
        value.informacoesAdicionais.saude
      );
      setValue(
        "informacoesAdicionais.problemasaude",
        value.informacoesAdicionais.problemasaude
      );
      setValue(
        "informacoesAdicionais.medicacao",
        value.informacoesAdicionais.medicacao
      );
      setValue(
        "informacoesAdicionais.tipomedicacao",
        value.informacoesAdicionais.tipomedicacao
      );
      setValue(
        "informacoesAdicionais.convenio",
        value.informacoesAdicionais.convenio
      );
      setValue(
        "informacoesAdicionais.imagem",
        value.informacoesAdicionais.imagem
      );
      setValue(
        "informacoesAdicionais.endereco",
        value.informacoesAdicionais.endereco
      );
      setValue(
        "informacoesAdicionais.pagadorMensalidades",
        value.informacoesAdicionais.pagadorMensalidades
      );
      setValue("nomeDaTurma", value.nomeDaTurma);
      setValue("modalidade", value.modalidade);
    } else {
      reset(); // Limpa o formulário se nenhum aluno for selecionado
    }
  };

  return (
    <Layout>
      <Container>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={BoxStyleCadastro}>
            <Box sx={{ display: "table", width: "100%" }}>
              <HeaderForm titulo={"Atualização de dados dos Atletas"} />
              <Autocomplete
                options={alunosOptions}
                getOptionLabel={(option) => {
                  return option ? option.nome : "";
                }}
                onChange={handleAlunoChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Nome do Aluno"
                    margin="normal"
                    required
                    fullWidth
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.alunoId}>
                    {option.nome}
                  </li>
                )}
              />
            </Box>
            {/*------------------------------------------------------------------------------------------------------------------------------------------------------------------------ */}

            {/*------------------------------------------------------------------------------------------------------------------------------------------------------------------------ */}
            <List sx={ListStyle}>
              <Typography sx={TituloSecaoStyle}>
              Seção 1 - Identificação do Aluno
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("anoNascimento", { required: true })}
                    label="Nascimento"
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("telefoneComWhatsapp", { required: true })}
                    label="Telefone"
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.rg", {
                      required: true,
                    })}
                    label="RG "
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
              </Grid>
            </List>
             {/*------------------------------------------------------------------------------------------------------------------------------------------------------------------------ */}
             <List sx={ListStyle}>
             <Typography sx={TituloSecaoStyle}>
                Seção 3 - Endereço Residencial do Aluno
              </Typography>
              <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.endereco.ruaAvenida", {
                      required: true,
                    })}
                    label="Rua/Avenida"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    value={
                      selectedAluno?.informacoesAdicionais?.endereco
                        ?.ruaAvenida || ""
                    }
                    onChange={(e) => {
                      if (
                        selectedAluno &&
                        selectedAluno.informacoesAdicionais &&
                        selectedAluno.informacoesAdicionais.endereco
                      ) {
                        setSelectedAluno({
                          ...selectedAluno,
                          informacoesAdicionais: {
                            ...selectedAluno.informacoesAdicionais,
                            endereco: {
                              ...selectedAluno.informacoesAdicionais.endereco,
                              ruaAvenida: e.target.value,
                            },
                          },
                        });
                        setValue(
                          "informacoesAdicionais.endereco.ruaAvenida",
                          e.target.value
                        );
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register(
                      "informacoesAdicionais.endereco.numeroResidencia",
                      {
                        required: true,
                      }
                    )}
                    label="nº"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    value={
                      selectedAluno?.informacoesAdicionais?.endereco
                        ?.numeroResidencia || ""
                    }
                    onChange={(e) => {
                      if (
                        selectedAluno &&
                        selectedAluno.informacoesAdicionais &&
                        selectedAluno.informacoesAdicionais.endereco
                          .numeroResidencia
                      ) {
                        setSelectedAluno({
                          ...selectedAluno,
                          informacoesAdicionais: {
                            ...selectedAluno.informacoesAdicionais,
                            endereco: {
                              ...selectedAluno.informacoesAdicionais.endereco,
                              numeroResidencia: e.target.value,
                            },
                          },
                        });
                        setValue(
                          "informacoesAdicionais.endereco.numeroResidencia",
                          e.target.value
                        );
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.endereco.cep", {
                      required: true,
                    })}
                    label="CEP"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    value={
                      selectedAluno?.informacoesAdicionais?.endereco?.cep || ""
                    }
                    onChange={(e) => {
                      if (
                        selectedAluno &&
                        selectedAluno.informacoesAdicionais &&
                        selectedAluno.informacoesAdicionais.endereco.cep
                      ) {
                        setSelectedAluno({
                          ...selectedAluno,
                          informacoesAdicionais: {
                            ...selectedAluno.informacoesAdicionais,
                            endereco: {
                              ...selectedAluno.informacoesAdicionais.endereco,
                              cep: e.target.value,
                            },
                          },
                        });
                        setValue(
                          "informacoesAdicionais.endereco.cep",
                          e.target.value
                        );
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.endereco.bairro", {
                      required: true,
                    })}
                    label="Bairro"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    value={
                      selectedAluno?.informacoesAdicionais?.endereco?.bairro ||
                      ""
                    }
                    onChange={(e) => {
                      if (
                        selectedAluno &&
                        selectedAluno.informacoesAdicionais &&
                        selectedAluno.informacoesAdicionais.endereco.bairro
                      ) {
                        setSelectedAluno({
                          ...selectedAluno,
                          informacoesAdicionais: {
                            ...selectedAluno.informacoesAdicionais,
                            endereco: {
                              ...selectedAluno.informacoesAdicionais.endereco,
                              bairro: e.target.value,
                            },
                          },
                        });
                        setValue(
                          "informacoesAdicionais.endereco.bairro",
                          e.target.value
                        );
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.endereco.complemento", {
                      required: true,
                    })}
                    label="Complemento"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    value={
                      selectedAluno?.informacoesAdicionais?.endereco
                        ?.complemento || ""
                    }
                    onChange={(e) => {
                      if (
                        selectedAluno &&
                        selectedAluno.informacoesAdicionais &&
                        selectedAluno.informacoesAdicionais.endereco.complemento
                      ) {
                        setSelectedAluno({
                          ...selectedAluno,
                          informacoesAdicionais: {
                            ...selectedAluno.informacoesAdicionais,
                            endereco: {
                              ...selectedAluno.informacoesAdicionais.endereco,
                              complemento: e.target.value,
                            },
                          },
                        });
                        setValue(
                          "informacoesAdicionais.endereco.complemento",
                          e.target.value
                        );
                      }
                    }}
                  />
                </Grid>

              </Grid>
             </List>
            {/*------------------------------------------------------------------------------------------------------------------------------------------------------------------------ */}
            <List sx={ListStyle}>
              <Typography sx={TituloSecaoStyle}>
                Seção 4 - Informações do Responsável Financeiro
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register(
                      "informacoesAdicionais.pagadorMensalidades.nomeCompleto",
                      {
                        required: true,
                      }
                    )}
                    label="Nome do Responsável"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    value={
                      selectedAluno?.informacoesAdicionais.pagadorMensalidades
                        .nomeCompleto || ""
                    }
                    onChange={(e) => {
                      if (
                        selectedAluno &&
                        selectedAluno.informacoesAdicionais &&
                        selectedAluno.informacoesAdicionais.pagadorMensalidades
                      ) {
                        setSelectedAluno({
                          ...selectedAluno,
                          informacoesAdicionais: {
                            ...selectedAluno.informacoesAdicionais,
                            pagadorMensalidades: {
                              ...selectedAluno.informacoesAdicionais
                                .pagadorMensalidades,
                              nomeCompleto: e.target.value,
                            },
                          },
                        });
                        setValue(
                          "informacoesAdicionais.pagadorMensalidades.nomeCompleto",
                          e.target.value
                        );
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register(
                      "informacoesAdicionais.pagadorMensalidades.cpf",
                      {
                        required: true,
                      }
                    )}
                    label="CPF do Responsável"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    value={
                      selectedAluno?.informacoesAdicionais.pagadorMensalidades
                        .cpf || ""
                    }
                    onChange={(e) => {
                      if (
                        selectedAluno &&
                        selectedAluno.informacoesAdicionais &&
                        selectedAluno.informacoesAdicionais.pagadorMensalidades
                      ) {
                        setSelectedAluno({
                          ...selectedAluno,
                          informacoesAdicionais: {
                            ...selectedAluno.informacoesAdicionais,
                            pagadorMensalidades: {
                              ...selectedAluno.informacoesAdicionais
                                .pagadorMensalidades,
                              cpf: e.target.value,
                            },
                          },
                        });
                        setValue(
                          "informacoesAdicionais.pagadorMensalidades.cpf",
                          e.target.value
                        );
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register(
                      "informacoesAdicionais.pagadorMensalidades.celularWhatsapp",
                      {
                        required: true,
                      }
                    )}
                    label="Telefone do Responsável"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    value={
                      selectedAluno?.informacoesAdicionais.pagadorMensalidades
                        .celularWhatsapp || ""
                    }
                    onChange={(e) => {
                      if (
                        selectedAluno &&
                        selectedAluno.informacoesAdicionais &&
                        selectedAluno.informacoesAdicionais.pagadorMensalidades
                      ) {
                        setSelectedAluno({
                          ...selectedAluno,
                          informacoesAdicionais: {
                            ...selectedAluno.informacoesAdicionais,
                            pagadorMensalidades: {
                              ...selectedAluno.informacoesAdicionais
                                .pagadorMensalidades,
                              celularWhatsapp: e.target.value,
                            },
                          },
                        });
                        setValue(
                          "informacoesAdicionais.pagadorMensalidades.celularWhatsapp",
                          e.target.value
                        );
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register(
                      "informacoesAdicionais.pagadorMensalidades.email",
                      {
                        required: true,
                      }
                    )}
                    label="Email do Responsável"
                    fullWidth
                    margin="normal"
                    variant="standard"
                    value={
                      selectedAluno?.informacoesAdicionais.pagadorMensalidades
                        .email || ""
                    }
                    onChange={(e) => {
                      if (
                        selectedAluno &&
                        selectedAluno.informacoesAdicionais &&
                        selectedAluno.informacoesAdicionais.pagadorMensalidades
                      ) {
                        setSelectedAluno({
                          ...selectedAluno,
                          informacoesAdicionais: {
                            ...selectedAluno.informacoesAdicionais,
                            pagadorMensalidades: {
                              ...selectedAluno.informacoesAdicionais
                                .pagadorMensalidades,
                              email: e.target.value,
                            },
                          },
                        });
                        setValue(
                          "informacoesAdicionais.pagadorMensalidades.email",
                          e.target.value
                        );
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </List>

            {/*------------------------------------------------------------------------------------------------------------------------------------------------------------------------ */}
            <List sx={ListStyle}>
              <Typography sx={TituloSecaoStyle}>
                Seção 5 - informações Gerais do Atleta
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.escolaEstuda", {
                      required: true,
                    })}
                    fullWidth
                    label="Escola que estuda"
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.irmaos", {
                      required: true,
                    })}
                    fullWidth
                    label="Possui irmãos?"
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.saude", {
                      required: true,
                    })}
                    fullWidth
                    label="Possui problemas de saúde? "
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.problemasaude", {
                      required: true,
                    })}
                    label="Quais problemas de saúde possui? "
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.medicacao", {
                      required: true,
                    })}
                    label="Faz uso de medicação? "
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.tipomedicacao", {
                      required: true,
                    })}
                    label="Qual o nome da(s) medicação(es) que faz uso? "
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.convenio", {
                      required: true,
                    })}
                    label="Qual convenio Possui? "
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.imagem", {
                      required: true,
                    })}
                    label="Autoriza o uso de imagem? "
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.filhofuncionarioJBS", {
                      required: true,
                    })}
                    label="É filho(a) de funcionário(a) da JBS? "
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.socioJBS", {
                      required: true,
                    })}
                    label="É sócio da sede da JBS?"
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.nomefuncionarioJBS", {
                      required: true,
                    })}
                    label="Nome do Funcionário(a) da JBS"
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.filhofuncionariomarcopolo", {
                      required: true,
                    })}
                    label="É filho(a) de funcionário(a) da Marcopolo?"
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.nomefuncionariomarcopolo", {
                      required: true,
                    })}
                    label="Nome do Funcionário(a) da Marcopolo"
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    {...register("informacoesAdicionais.uniforme", {
                      required: true,
                    })}
                    label="Tamanho Escolhido para o uniforme"
                    fullWidth
                    margin="normal"
                    variant="standard"
                  />
                </Grid>
              </Grid>
            </List>

            {/*------------------------------------------------------------------------------------------------------------------------------------------------------------------------ */}
            <List sx={ListStyle}>
              <Typography sx={TituloSecaoStyle}>
                Seção 5 - Modalidade e Turma
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register("nomeDaTurma", { required: true })}
                    fullWidth
                    margin="normal"
                    variant="standard"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    {...register("modalidade", { required: true })}
                    fullWidth
                    margin="normal"
                    variant="standard"
                    disabled
                  />
                </Grid>
              </Grid>
            </List>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting
                ? "Enviando dados,aguarde..."
                : "Atualizar dados do Atleta"}
            </Button>
          </Box>
        </form>
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
  return {
    props: {
      /* props adicionais aqui */
    },
  };
};
