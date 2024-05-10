import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Autocomplete, Button, TextField, Typography, Box, Container } from '@mui/material';
import { DataContext } from "@/context/context";
import { AlunoAutocompleteOption, Modalidade } from "@/interface/interfaces";
import Layout from '@/components/TopBarComponents/Layout';
import { BoxStyleCadastro } from '@/utils/Styles';
import { HeaderForm } from '@/components/HeaderDefaultForm';
import axios from 'axios';

export default function DeleteStudentsComponent() {
  const { deleteStudentFromApi, modalidades, fetchModalidades } = useContext(DataContext);
  const { handleSubmit, control, reset } = useForm();
  const [selectedAluno, setSelectedAluno] = useState<AlunoAutocompleteOption | null>(null);
  const [alunosOptions, setAlunosOptions] = useState<AlunoAutocompleteOption[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);  // State to track if data is loaded

  useEffect(() => {
    if (!dataLoaded) {
      fetchModalidades().then(() => {
        setDataLoaded(true); // Set data as loaded
      }).catch(console.error);
    }
  }, [dataLoaded, fetchModalidades]);

  useEffect(() => {
    if (modalidades.length > 0 && dataLoaded) {
      const alunosExtraidos = modalidades.flatMap(modalidade =>
        modalidade.turmas.flatMap(turma =>
          (turma.alunos || []).map(aluno => ({
            id: aluno?.informacoesAdicionais?.IdentificadorUnico!,
            nome: aluno?.nome ?? "",
            modalidade: modalidade.nome,
            turma: turma.nome_da_turma,
            nucleo: turma.nucleo
          }))
        )
      );
      setAlunosOptions(alunosExtraidos);
    }
  }, [modalidades, dataLoaded]);

  const onSubmit = useCallback(async () => {
    if (selectedAluno) {
      setIsDeleting(true);
      await deleteStudentFromApi({
        alunoId: selectedAluno.id,
        modalidade: selectedAluno.modalidade,
        nomeDaTurma: selectedAluno.turma,
        alunosNomes: selectedAluno.nome
      });
      alert("Aluno deletado com sucesso.");
      reset();
      setSelectedAluno(null);
      setAlunosOptions(prev => prev.filter(aluno => aluno.id !== selectedAluno.id));
      await axios.post('/api/AjustarDadosTurma'); // Corrige os dados
      setIsDeleting(false);
    } else {
      alert("Selecione um aluno para deletar.");
    }
  }, [deleteStudentFromApi, selectedAluno, reset]);

  return (
    <Layout>
      <Container>
        <Box component="form" sx={BoxStyleCadastro} onSubmit={handleSubmit(onSubmit)} noValidate>
          <HeaderForm titulo={"Deletar Alunos"} />
          <Controller
            name="alunoId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                value={selectedAluno}
                options={alunosOptions}
                getOptionLabel={(option) => option.nome}
                onChange={(_, value) => setSelectedAluno(value)}
                renderInput={(params) => <TextField {...params} label="Selecione o Aluno" variant="outlined" fullWidth />}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            )}
          />
          {selectedAluno && (
            <Typography variant="body1" sx={{ mt: 2, color: "black", fontWeight: "bold" }}>
              Turma: {selectedAluno.turma}
            </Typography>
          )}
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }} disabled={isDeleting}>
            {isDeleting ? "Deletando estudante e atualizando turmas.. aguarde.." : "Deletar Aluno"}
          </Button>
        </Box>
      </Container>
    </Layout>
  );
}
