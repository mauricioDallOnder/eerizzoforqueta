import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Autocomplete, Button, TextField, Typography, Box, Container } from '@mui/material';
import { DataContext } from "@/context/context";
import { ArchiveAluno } from "@/interface/interfaces";
import Layout from '@/components/TopBarComponents/Layout';
import { BoxStyleCadastro } from '@/utils/Styles';
import axios from 'axios';
import { HeaderForm } from '@/components/HeaderDefaultForm';

export default function ArquivarAlunos() {
    const { deleteStudentFromApi, modalidades, fetchModalidades } = useContext(DataContext);
    const { handleSubmit, control } = useForm();
    const [selectedAluno, setSelectedAluno] = useState<ArchiveAluno | null>(null);
    const [alunosOptions, setAlunosOptions] = useState<ArchiveAluno[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false); // State to track if data is loaded

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
                        alunoId: aluno.id.toString(),
                        nome: aluno.nome ?? "",
                        anoNascimento: aluno.anoNascimento ?? "",
                        telefoneComWhatsapp: aluno.telefoneComWhatsapp ?? "",
                        informacoesAdicionais: aluno.informacoesAdicionais ?? "",
                        modalidade: modalidade.nome,
                        nomeDaTurma: turma.nome_da_turma,
                        dataMatricula: aluno.dataMatricula ?? "",
                        foto: aluno.foto ?? ""
                    }))
                )
            );
            setAlunosOptions(alunosExtraidos);
        }
    }, [modalidades, dataLoaded]);

    const onSubmit = useCallback(async () => {
        if (selectedAluno) {
            setIsDeleting(true);
            try {
                const response = await axios.post('/api/ArquivarAlunos', selectedAluno);
                const data = response.data;
                if (data.status === 'Success') {
                    setAlunosOptions(prev => prev.filter(aluno => aluno.alunoId !== selectedAluno.alunoId));
                   await axios.get(`https://script.google.com/macros/s/AKfycbxsjLlL_MJXTrO8zkegPoJJRDGABeRYrgdrA0zepshtMqSnuALt71kIcFVEX47KwQXQUg/exec?delete=true&identificadorUnico=${selectedAluno.informacoesAdicionais.IdentificadorUnico}`)
                   await axios.post('/api/AjustarDadosTurma'); // Corrige os dados
                } else {
                    throw new Error('Falha ao arquivar o aluno');
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsDeleting(false);
                setSelectedAluno(null);
                alert("Aluno arquivado com sucesso.")
            }
        } else {
            alert("Selecione um aluno para arquivar.");
        }
    }, [selectedAluno]);

    return (
        <Layout>
            <Container>
                <Box component="form" sx={BoxStyleCadastro} onSubmit={handleSubmit(onSubmit)} noValidate>
                    <HeaderForm titulo={"Arquivar Alunos"} />
                    <Typography sx={{ color: "black", fontWeight: "bold" }}>Ao arquivar os alunos eles serão deletados do banco de dados, mas os seus dados serão salvos em uma planilha do google que pode ser acessada por esse link:<br />
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
                    {selectedAluno && (
                        <Typography variant="body1" sx={{ mt: 2, color: "black", fontWeight: "bold" }}>
                            Turma: {selectedAluno.nomeDaTurma}
                        </Typography>
                    )}
                    <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }} disabled={isDeleting}>
                        {isDeleting ? "Arquivando estudante e atualizando turmas.. aguarde.." : "Arquivar Aluno"}
                    </Button>
                </Box>
            </Container>
        </Layout>
    );
}


//          axios.get(`https://script.google.com/macros/s/AKfycbxsjLlL_MJXTrO8zkegPoJJRDGABeRYrgdrA0zepshtMqSnuALt71kIcFVEX47KwQXQUg/exec?delete=true&identificadorUnico=${selectedAluno.informacoesAdicionais.IdentificadorUnico}`)
