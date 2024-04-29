import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Autocomplete, Button, TextField, Typography, Box, Container } from '@mui/material';
import { DataContext } from "@/context/context";
import { ArchiveAluno } from "@/interface/interfaces";
import Layout from '@/components/TopBarComponents/Layout';
import { BoxStyleCadastro } from '@/utils/Styles';
import { HeaderForm } from '@/components/HeaderDefaultForm';
import axios from 'axios';

export default function ArquivarAlunos() {
    const { deleteStudentFromApi, modalidades, fetchModalidades } = useContext(DataContext);
    const { handleSubmit, control, reset } = useForm();
    const [selectedAluno, setSelectedAluno] = useState<ArchiveAluno | null>(null);
    const [alunosOptions, setAlunosOptions] = useState<ArchiveAluno[]>([]);
    const [isDeleting, setIsDeleting] = useState(false); // Adicionado para controlar o estado do processo
  
    useEffect(() => {
        fetchModalidades().catch(console.error);
      }, []);
    useEffect(() => {
        const alunosExtraidos = modalidades.flatMap(modalidade =>
          modalidade.turmas.flatMap(turma =>
            (turma.alunos || []).filter(aluno => turma.nome_da_turma !== "excluidos").map(aluno => ({
              alunoId: aluno?.id?.toString(),
              nome: aluno?.nome ?? "",
              anoNascimento: aluno?.anoNascimento?? "",
              telefoneComWhatsapp: aluno?.telefoneComWhatsapp ?? "",
              informacoesAdicionais: aluno?.informacoesAdicionais??"",
              modalidade: modalidade.nome,
              nomeDaTurma: turma.nome_da_turma,
              dataMatricula: aluno?.dataMatricula ?? "",
              foto: aluno?.foto ?? ""
            }))
          )
        );
        setAlunosOptions(alunosExtraidos);
      }, [modalidades]);
      
  
      const onSubmit = useCallback(async () => {
        if (selectedAluno) {
          setIsDeleting(true);
          try {
            const response = await fetch('/api/ArquivarAlunos', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(selectedAluno),
            });
      
            const data = await response.json();
            if (data.status === 'Success') {
             
            
              setAlunosOptions(prev => prev.filter(aluno => aluno.alunoId !== selectedAluno.alunoId));
            } else {
              throw new Error('Falha ao arquivar o aluno');
            }
          } catch (error) {
            console.error('Error:', error);
          }
          setSelectedAluno(null);
          await axios.get(`https://script.google.com/macros/s/AKfycbxsjLlL_MJXTrO8zkegPoJJRDGABeRYrgdrA0zepshtMqSnuALt71kIcFVEX47KwQXQUg/exec?delete=true&identificadorUnico=${selectedAluno.informacoesAdicionais.IdentificadorUnico}`)
          await axios.post('/api/AjustarDadosTurma'); // Corrige os dados
          alert("Aluno arquivado com sucesso.")
          setIsDeleting(false);
         
        } else {
          alert("Selecione um aluno para arquivar.");
        }
      }, [selectedAluno, reset]);
      
  


    return (
        <Layout>
            <Container>
                <Box component="form" sx={BoxStyleCadastro} onSubmit={handleSubmit(onSubmit)} noValidate>
                    <HeaderForm titulo={"Arquivar Alunos"} />
                    <Typography sx={{color:"black",fontWeight:"bold"}}>Ao arquivar os alunos eles serão deletados do banco de dados, mas os seus dados serão salvos em uma planilha do google que pode ser acessada por esse link:<br/>
                    <a href="https://docs.google.com/spreadsheets/d/1RPYA67-ycJAypRlN_GDwNtqpx0sKhyjF7NfDLTbshG8/edit#gid=0">Acessar Planilha de Alunos Arquivados</a>
                    </Typography>
                    <br />
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
                                isOptionEqualToValue={(option, value) => option.alunoId === value.alunoId}
                            />
                        )}
                    />
                    <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }} disabled={isDeleting}>
                        {isDeleting ? "Arquivando estudante e atualizando turmas.. aguarde.." : "Arquivar Aluno"}
                    </Button>
                </Box>
            </Container>
        </Layout>
    );
}
