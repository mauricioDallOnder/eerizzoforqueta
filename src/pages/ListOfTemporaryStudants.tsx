import Layout from "@/components/TopBarComponents/Layout";
import { useData } from "@/context/context";
import { Aluno, Turma } from "@/interface/interfaces";
import {
  Box,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Container,
} from "@mui/material";
import React, { useState, useEffect } from "react";

export default function TurmasTemporariosTable() {
  const { fetchModalidades } = useData();
  const [alunosComTurma, setAlunosComTurma] = useState<{ aluno: Aluno; nomeDaTurma: string;dataMatricula:string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchModalidades().then((modalidadesFetched) => {
      const modalidadeTemporarios = modalidadesFetched.find((modalidade) => modalidade.nome.toLowerCase() === "temporarios");
      if (modalidadeTemporarios && Array.isArray(modalidadeTemporarios.turmas)) {
        const alunosComTurmaTemp = modalidadeTemporarios.turmas.flatMap((turma) => {
          const alunosArray = Array.isArray(turma.alunos) ? turma.alunos : [];
          return alunosArray.filter(Boolean).map((aluno) => ({
            aluno,
            nomeDaTurma: turma.nome_da_turma,
            dataMatricula: aluno.dataMatricula!
          }));
        });
        setAlunosComTurma(alunosComTurmaTemp);
      }
    });
  }, [fetchModalidades]);

  const filteredAlunosComTurma = alunosComTurma.filter(({ aluno, nomeDaTurma }) =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) || nomeDaTurma.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
    <Container>
      <Typography variant="h6" sx={{ margin: 2 }}>
        Alunos Temporários
      </Typography>
      <Paper sx={{backgroundColor:"white",color:"black",mb:"10px"}}>
      <TextField
        fullWidth
        label="Pesquisar por nome do aluno ou turma"
        variant="outlined"
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{width:"80%"}}
      />
      </Paper>
    
      <TableContainer component={Paper}>
        <Table aria-label="alunos temporários" sx={{border:"1px solid black"}}>
          <TableHead>
            <TableRow>
              <TableCell>Nome do Aluno</TableCell>
              <TableCell>Nome da Turma</TableCell>
              <TableCell>Data Matricula</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlunosComTurma.map(({ aluno, nomeDaTurma }, index) => (
              <TableRow key={index}>
                <TableCell>{aluno.nome}</TableCell>
                <TableCell>{nomeDaTurma}</TableCell>
                <TableCell>{aluno.dataMatricula}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
    </Layout>
  );
}
