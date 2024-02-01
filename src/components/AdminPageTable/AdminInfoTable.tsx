import * as React from "react";
import Box from "@mui/material/Box";
import { AdminPageProps } from "@/interface/interfaces";
import {
  TableRow,
  TableCell,
  Table,
  TableHead,
  TableBody,
  TableContainer,
  Paper,
  Divider,
} from "@mui/material";
import { ControleFrequenciaTableNoSSR } from "./DynamicComponents";

export default function AdminInfoTable({ modalidades }: AdminPageProps) {
  const rows = Array.isArray(modalidades)
    ? modalidades.flatMap((modalidade) =>
        modalidade.turmas.map((turma) => ({
          id: turma.nome_da_turma, // Usar o nome da turma como id é mais significativo
          nomeDaTurma: turma.nome_da_turma,
          modalidade: modalidade.nome,
          nucleo: turma.nucleo,
          categoria: turma.categoria,
          capacidadeMaxima: turma.capacidade_maxima_da_turma,
          capacidadeAtual: turma.capacidade_atual_da_turma,
          numeroAlunos: turma.alunos?.length || 0,
          vagasDisponiveis:
            turma.capacidade_maxima_da_turma - (turma.alunos?.length || 0),
          alunosdaTurma: turma?.alunos || [],
        }))
      )
    : [];

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Nome da Turma</TableCell>
              <TableCell align="center">Modalidade</TableCell>
              <TableCell align="center">Núcleo</TableCell>
              <TableCell align="center">Categoria</TableCell>
              <TableCell align="center">Número de Alunos</TableCell>
              <TableCell align="center">Vagas Disponíveis</TableCell>
              <TableCell align="center">Capacidade Atual</TableCell>
              <TableCell align="center">Capacidade Máxima</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <React.Fragment key={row.id}>
                <TableRow>
                  <TableCell align="center">{row.nomeDaTurma}</TableCell>
                  <TableCell align="center">{row.modalidade}</TableCell>
                  <TableCell align="center">{row.nucleo}</TableCell>
                  <TableCell align="center">{row.categoria}</TableCell>
                  <TableCell align="center">{row.numeroAlunos}</TableCell>
                  <TableCell align="center">{row.vagasDisponiveis}</TableCell>
                  <TableCell align="center">{row.capacidadeAtual}</TableCell>
                  <TableCell align="center">{row.capacidadeMaxima}</TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      {rows.map((row, index) => (
        <ControleFrequenciaTableNoSSR
          key={index}
          alunosDaTurma={row.alunosdaTurma}
          nomeDaTurma={row.nomeDaTurma}
        />
      ))}
    </Box>
  );
}
