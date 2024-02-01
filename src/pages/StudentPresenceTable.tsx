import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  List,
  Container,
  Modal,
} from "@mui/material";
import { useData } from "@/context/context";
import { Aluno, FormValuesStudent, Turma } from "@/interface/interfaces";
import { BoxStyleFrequencia, ListStyle } from "@/utils/Styles";
import { ListaDeChamada } from "@/components/ListaDeChamada";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import { HeaderForm } from "@/components/HeaderDefaultForm";
import Layout from "@/components/TopBarComponents/Layout";
import TemporaryStudentRegistration from "@/components/TemporaryStudents/StudentTemporaryModalRegistration";

export default function StudentPresenceTable() {
  const { handleSubmit, watch, setValue } = useForm<FormValuesStudent>({
    defaultValues: {
      modalidade: "", // Iniciar com valor vazio para evitar estado não controlado
      turmaSelecionada: "",
    },
  });
  const { modalidades } = useData();
  const [selectedNucleo, setSelectedNucleo] = useState<string>("");
  const [nucleosDisponiveis, setNucleosDisponiveis] = useState<string[]>([]);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [alunosDaTurma, setAlunosDaTurma] = useState<Aluno[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const watchedModalidade = watch("modalidade");
  const refreshPage = ()=>{
    alert('Dados salvos com sucesso')
    window.location.reload();  }
  useEffect(() => {
    if (watchedModalidade) {
      const turmas = modalidades.find(
        (m) => m.nome === watchedModalidade
      )?.turmas;
      if (turmas) {
        const nucleos = new Set(turmas.map((turma) => turma.nucleo));
        setNucleosDisponiveis(Array.from(nucleos));
      }

      setTurmasDisponiveis([]);
    }
  }, [watchedModalidade, modalidades]);

  useEffect(() => {
    if (selectedNucleo && watchedModalidade) {
      const turmasFiltradas = modalidades
        .find((m) => m.nome === watchedModalidade)
        ?.turmas.filter((turma) => turma.nucleo === selectedNucleo);
      setTurmasDisponiveis(turmasFiltradas || []);
    }
  }, [selectedNucleo, watchedModalidade, modalidades]);

  const handleModalidadeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const value = event.target.value as string;
    setValue("modalidade", value);
    setValue("turmaSelecionada", ""); // Resetar a turma selecionada
  };

  const handleNucleoChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setSelectedNucleo(value);
    setValue("turmaSelecionada", ""); // Resetar a turma selecionada
  };

  const handleTurmaChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setSelectedTurma(value);
    setValue("turmaSelecionada", value); // Atualizar o valor da turma no formulário
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const onSubmit: SubmitHandler<FormValuesStudent> = async (data) => {
    const turmaEscolhida = modalidades
      .find((m) => m.nome === data.modalidade)
      ?.turmas.find((t) => t.nome_da_turma === data.turmaSelecionada);

    if (turmaEscolhida && Array.isArray(turmaEscolhida.alunos)) {
      setAlunosDaTurma(turmaEscolhida.alunos);
    }
  };

  return (
    <Layout>
      <Container>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={BoxStyleFrequencia}>
            <HeaderForm titulo={"Lista de Chamada"} />
            <List sx={ListStyle}>
              <Grid container spacing={2}>
                {/* Campo para selecionar a modalidade */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    required
                    label="Modalidade"
                    value={watchedModalidade}
                    onChange={handleModalidadeChange}
                    fullWidth
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                  >
                    {modalidades
                      .filter(
                        (modalidade) =>
                          modalidade.nome !== "arquivados"&&
                          modalidade.nome !== "excluidos"
                      )
                      .map((modalidade) => (
                        <MenuItem key={modalidade.nome} value={modalidade.nome}>
                          {modalidade.nome}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>

                {/* Campo para selecionar o núcleo */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Local de treinamento"
                    value={selectedNucleo}
                    onChange={handleNucleoChange}
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

                {/* Campo para selecionar a turma */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Turma"
                    value={selectedTurma}
                    onChange={handleTurmaChange}
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
              </Grid>
             
              {alunosDaTurma.length > 0 && (
                <ListaDeChamada
                  alunosDaTurma={alunosDaTurma}
                  setAlunosDaTurma={setAlunosDaTurma}
                  modalidade={watchedModalidade}
                  nomeDaTurma={selectedTurma}
                />
              )}
            </List>
            <Button
                sx={{ width: "100%", marginBottom: "8px" }}
                type="submit"
                variant="contained"
              >
                Pesquisar Turma
              </Button>
            <Button
          sx={{fontSize: "12px" }}
          color="error"
          variant="contained"
          onClick={() => handleOpenModal()}
        >
          Adicionar aluno temporário
        </Button>
        <Button sx={{fontSize: "12px",mt:"8px" }} color="success"
          variant="contained" onClick={refreshPage}>Salvar Dados/Atualizar Pagina</Button>
          </Box>
        </form>
        <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <TemporaryStudentRegistration handleCloseModal={handleCloseModal} />
      </Modal>
      
      </Container>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // Permitir acesso se o usuário for admin ou professor
  if (
    !session ||
    (session.user.role !== "admin" && session.user.role !== "professor")
  ) {
    return {
      redirect: {
        destination: "/NotAllowPage",
        permanent: false,
      },
    };
  }

  // Retornar props aqui se a permissão for válida
  return { props: {} }; // Pode retornar props vazias ou adicionais conforme necessário
};
