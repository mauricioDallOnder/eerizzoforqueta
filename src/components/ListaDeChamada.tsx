import React, { useContext, useState } from "react";
import {
  Box,
  Container,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Modal,
  TableContainer,
  Paper,
  useMediaQuery,
  useTheme,
  Button,
  Typography,
} from "@mui/material";
import Table from "@mui/joy/Table";
import { Aluno, StudentPresenceTableProps } from "@/interface/interfaces"; // Importe a interface Aluno conforme definida
import { DataContext } from "@/context/context";
import { modalStyle } from "@/utils/Styles";
import { ListaDeChamadaModal } from "./ListaDeChamadaModal";

export const ListaDeChamada: React.FC<StudentPresenceTableProps> = ({
  alunosDaTurma,
  setAlunosDaTurma,
  modalidade,
  nomeDaTurma,
}) => {
  const { updateAttendanceInApi } = useContext(DataContext); // Use o useContext para acessar a função
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));

  const tableContainerStyles = {
    marginTop: 2,
    marginBottom: 2,
    overflowX: "auto", // Permite rolagem horizontal
    maxWidth: "100%",
    ...(isXs && {
      // Estilos adicionais para telas pequenas
      "& .MuiTableCell-sizeSmall": {
        // Diminui o padding das células para telas pequenas
        padding: "6px 8px",
      },
      "& .MuiTypography-root": {
        // Diminui o tamanho da fonte para telas pequenas
        fontSize: "0.75rem",
      },
    }),
  };

  // Gera uma lista de dias com base no mês selecionado
  console.log(alunosDaTurma)
  const daysInMonth =
    alunosDaTurma.length > 0
      ? Object.keys(
          alunosDaTurma.find((aluno) => aluno !== null)?.presencas[
            selectedMonth
          ] || {}
        )
      : [];

  const handleOpenModal = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAluno(null);
  };
  // Função para lidar com a mudança no campo de pesquisa
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };
  // Filtre os alunos com base na string de pesquisa
  const filteredAlunos = alunosDaTurma.filter((aluno) => {
    // Verificar se o aluno não é nulo antes de acessar suas propriedades
    return aluno && aluno.nome.toLowerCase().includes(search.toLowerCase());
  });

  const toggleAttendance = (alunoId: number, day: string) => {
    setAlunosDaTurma((current) =>
      current.map((student) => {
        if (student !== null && student.id === alunoId) {
          const updatedAttendance = {
            ...student.presencas,
            [selectedMonth]: {
              ...student.presencas[selectedMonth],
              [day]: !student.presencas[selectedMonth][day],
            },
          };

          // Preparar dados para a atualização
          const alunoUpdateData = {
            ...student,
            modalidade: modalidade,
            nomeDaTurma: nomeDaTurma,
            // Converta alunoId para string aqui
            alunoId: alunoId.toString(),
            presencas: updatedAttendance,
          };

          // Chama a função do contexto para atualizar as presenças
          updateAttendanceInApi(alunoUpdateData);

          return { ...student, presencas: updatedAttendance };
        }
        return student;
      })
    );
  };

  const countPresentStudents = () => {
    return alunosDaTurma.reduce((count, aluno) => {
      // Verifica se o aluno não é nulo e se tem presenças registradas para o mês e dia selecionados
      const isPresent =
        aluno &&
        aluno.presencas &&
        aluno.presencas[selectedMonth] &&
        aluno.presencas[selectedMonth][selectedDay];
      return count + (isPresent ? 1 : 0);
    }, 0);
  };

  return (
    <Container>
      <Box>
        <Modal
          open={isModalOpen}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box sx={modalStyle}>
            {selectedAluno && (
              <ListaDeChamadaModal
                aluno={selectedAluno}
                month={selectedMonth}
              />
            )}
            <Box sx={{ backgroundColor: "red" }}>
              <Typography
                sx={{
                  color: "black",
                  fontWeight: "bold",
                  textAlign: "center",
                  padding: "5px",
                }}
              >
                {" "}
                Telefone para Emergência: {selectedAluno?.telefoneComWhatsapp}
              </Typography>
            </Box>
          </Box>
        </Modal>

        <TextField
          select
          label="Selecionar Mês"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          fullWidth
        >
          <MenuItem value="janeiro">Janeiro</MenuItem>
          <MenuItem value="fevereiro">Fevereiro</MenuItem>
          <MenuItem value="março">Março</MenuItem>
          <MenuItem value="abril">Abril</MenuItem>
          <MenuItem value="maio">maio</MenuItem>
          <MenuItem value="junho">junho</MenuItem>
          <MenuItem value="julho">julho</MenuItem>
          <MenuItem value="agosto">agosto</MenuItem>
          <MenuItem value="setembro">setembro</MenuItem>
          <MenuItem value="outubro">outubro</MenuItem>
          <MenuItem value="novembro">novembro</MenuItem>
          <MenuItem value="dezembro">dezembro</MenuItem>
        </TextField>

        {selectedMonth && (
          <TextField
            select
            label="Selecionar Dia"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            fullWidth
            margin="normal"
          >
            {daysInMonth.map((day) => (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            ))}
          </TextField>
        )}
        <TextField
          label="Pesquisar por nome do aluno"
          variant="outlined"
          fullWidth
          margin="normal"
          value={search}
          onChange={handleSearchChange}
        />

        {selectedDay && (
          <TableContainer component={Paper} sx={tableContainerStyles}>
            <Table
              borderAxis="both"
              size="sm"
              aria-label="tabela de presença"
              sx={{
                minWidth: 245,
                "& th, & td": {
                  fontSize: isXs ? "0.75rem" : "0.75rem",
                  padding: isXs ? "8px" : "16px",
                },
                "& tr": {
                  height: isXs ? "40px" : "60px",
                },
                "& thead th": {
                  fontWeight: "bold",
                  backgroundColor: "#eceff1",
                },
                "& tbody tr:nth-of-type(odd)": {
                  backgroundColor: "rgba(247, 247, 247, 1)",
                },
                "& tbody tr:hover": {
                  backgroundColor: "rgba(237, 245, 251, 1)",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#eceff1",
                      textAlign: "center",
                    }}
                  >
                    Nome do Aluno
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#eceff1",
                      textAlign: "center",
                    }}
                  >
                    Frequência
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#eceff1",
                      textAlign: "center",
                    }}
                  >
                    Exibir Informações do atleta
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAlunos.map((aluno, index) => (
                  <TableRow
                    key={aluno.nome}
                    sx={{ "& > *": { borderBottom: "unset" } }}
                  >
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {aluno.nome}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "black", fontWeight: "bold" }}
                      onClick={() => toggleAttendance(aluno.id, selectedDay)}
                    >
                      {aluno.presencas[selectedMonth][selectedDay] ? "." : "F"}
                    </TableCell>

                    <TableCell onClick={() => handleOpenModal(aluno)}>
                      <Button
                        sx={{ width: "50px", fontSize: "12px" }}
                        variant="contained"
                      >
                        Abrir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      {selectedDay && (
        <Typography
          sx={{ color: "black", fontWeight: "bold" }}
          variant="subtitle1"
        >
          Número de alunos presentes: {countPresentStudents()}
        </Typography>
      )}
    </Container>
  );
};
