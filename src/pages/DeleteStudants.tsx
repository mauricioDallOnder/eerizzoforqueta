import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Autocomplete, Button, TextField, Typography, Box, Container } from '@mui/material';
import { DataContext } from "@/context/context";
import { AlunoAutocompleteOption, Modalidade } from "@/interface/interfaces";
import axios from 'axios';
import Layout from '@/components/TopBarComponents/Layout';
import { BoxStyleCadastro } from '@/utils/Styles';
import { HeaderForm } from '@/components/HeaderDefaultForm';

export default function DeleteStudentsComponent() {
  const { deleteStudentFromApi, modalidades, fetchModalidades } = useContext(DataContext);
  const { handleSubmit, control, reset } = useForm();
  const [selectedAluno, setSelectedAluno] = useState<AlunoAutocompleteOption | null>(null);
  const [alunosOptions, setAlunosOptions] = useState<AlunoAutocompleteOption[]>([]);
  const [isDeleting, setIsDeleting] = useState(false); // Adicionado para controlar o estado do processo

  useEffect(() => {
    fetchModalidades().catch(console.error);
  }, []);

  useEffect(() => {
    const alunosExtraidos = modalidades.flatMap(modalidade =>
      modalidade.turmas.flatMap(turma =>
        (turma.alunos || []).filter(aluno => turma.nome_da_turma !== "excluidos").map(aluno => ({
          id: aluno?.informacoesAdicionais?.IdentificadorUnico!,
          nome: aluno?.nome ?? "",
          modalidade: modalidade.nome,
          turma: turma.nome_da_turma,
          nucleo: turma.nucleo,
          key: `${aluno?.informacoesAdicionais?.IdentificadorUnico}-${modalidade.nome}-${turma.nome_da_turma}`
        }))
      )
    );
    setAlunosOptions(alunosExtraidos);
  }, [modalidades]);

  const onSubmit = useCallback(async () => {
    if (selectedAluno) {
      setIsDeleting(true); // Inicia o processo de deleção
      await deleteStudentFromApi({
        alunoId: selectedAluno.id,
        modalidade: selectedAluno.modalidade,
        nomeDaTurma: selectedAluno.turma,
        alunosNomes: selectedAluno.nome
      });
      await axios.post('/api/AjustarDadosTurma'); // Corrige os dados
      alert("Aluno deletado com sucesso.");
      reset();
      setSelectedAluno(null);
      setAlunosOptions(prev => prev.filter(aluno => aluno.id !== selectedAluno.id));
      setIsDeleting(false); // Termina o processo de deleção
    } else {
      alert("Selecione um aluno para deletar.");
    }
  }, [deleteStudentFromApi, selectedAluno, reset]);

  return (
    <Layout>
      <Container>
    <Box component="form"  sx={BoxStyleCadastro} onSubmit={handleSubmit(onSubmit)} noValidate >
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
      <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }} disabled={isDeleting}>
        {isDeleting ? "Deletando estudante e atualizando turmas.. aguarde.." : "Deletar Aluno"}
      </Button>
    </Box>
    </Container>
    </Layout>
  );
}
