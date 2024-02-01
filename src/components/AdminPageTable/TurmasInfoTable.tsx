import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { AdminPageProps, Turma } from "@/interface/interfaces";
import {
  TableRow,
  TableCell,
  Table,
  TableHead,
  TableBody,
  TableContainer,
  Paper,
  Divider,
  Modal,
  TextField,
} from "@mui/material";

import { ControleFrequenciaTableNoSSR } from "./DynamicComponents";
import { modalStyle } from "@/utils/Styles";

export default function TurmasInfoTable({ modalidades }: AdminPageProps) {
  const [search, setSearch] = useState("");

  const [selectedTurma, setSelectedTurma] = React.useState<Turma | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleRowClick = (turma: Turma) => {
    setSelectedTurma(turma);
    setIsModalOpen(true);
  };

  const rows = Array.isArray(modalidades)
    ? modalidades.flatMap((modalidade) =>
        modalidade.turmas.map((turma) => ({
          ...turma, // Espalha as propriedades de 'turma' aqui
          modalidade: modalidade.nome, // Adiciona a propriedade 'modalidade'
        }))
      )
    : [];

  // Função para lidar com a mudança no campo de pesquisa
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  // Filtrar as linhas com base na string de pesquisa
  const filteredRows = rows.filter(
    (row) =>
      row.nome_da_turma.toLowerCase().includes(search.toLowerCase()) ||
      row.modalidade.toLowerCase().includes(search.toLowerCase()) ||
      row.categoria.toLowerCase().includes(search.toLowerCase()) ||
      row.nucleo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <TableContainer component={Paper}>
        <TextField
          label="Pesquisar por nome nome da turma"
          variant="outlined"
          fullWidth
          margin="normal"
          value={search}
          onChange={handleSearchChange}
          sx={{ width: "70%", marginLeft: "30px" }}
        />
        <Divider />
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: "1px solid black" }} align="center">
                Nome da Turma
              </TableCell>
              <TableCell align="center" sx={{ border: "1px solid black" }}>
                Modalidade
              </TableCell>
              <TableCell align="center" sx={{ border: "1px solid black" }}>
                Núcleo
              </TableCell>
              <TableCell align="center" sx={{ border: "1px solid black" }}>
                Categoria
              </TableCell>
              <TableCell align="center" sx={{ border: "1px solid black" }}>
                Número de Alunos
              </TableCell>
              <TableCell align="center" sx={{ border: "1px solid black" }}>
                Vagas Disponíveis
              </TableCell>
              <TableCell align="center" sx={{ border: "1px solid black" }}>
                Capacidade Atual
              </TableCell>
              <TableCell align="center" sx={{ border: "1px solid black" }}>
                Capacidade Máxima
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row, index) => (
              <React.Fragment key={index}>
                <TableRow
                  onClick={() => handleRowClick(row)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {row.nome_da_turma}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {row.modalidade}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {row.nucleo}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {row.categoria}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {row.alunos?.length || 0}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {row.capacidade_maxima_da_turma - (row.alunos?.length || 0)}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {row.capacidade_atual_da_turma}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid black" }} align="center">
                    {row.capacidade_maxima_da_turma}
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={modalStyle}>
          {selectedTurma && (
            <ControleFrequenciaTableNoSSR
              alunosDaTurma={selectedTurma.alunos}
              nomeDaTurma={selectedTurma.nome_da_turma}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
}
