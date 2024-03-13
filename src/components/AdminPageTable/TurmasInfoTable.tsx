/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { Modalidade, Turma } from '@/interface/interfaces'
import {
  TableRow,
  TableCell,
  Table,
  TableHead,
  TableBody,
  TableContainer,
  Paper,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Button,
} from '@mui/material'

import { ControleFrequenciaTableNoSSR } from './DynamicComponents'
import { BoxStyleCadastro, TituloSecaoStyle } from '@/utils/Styles'
import { useData } from '@/context/context'
import { TurmaPresencaSemanal } from './TurmaPresencaSemanal'

export default function TurmasInfoTable() {
  const { fetchModalidades } = useData()
  const [modalidades, setModalidades] = useState<Modalidade[]>([])
  const [selectedModalidade, setSelectedModalidade] = useState<string>('')
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false) // Estado para o modal ControleFrequenciaTableNoSSR
  const [isPresencaSemanalModalOpen, setIsPresencaSemanalModalOpen] =
    useState(false) // Estado para o modal TurmaPresencaSemanal
  const [searchTerm, setSearchTerm] = useState<string>('')

  const handleOpenModal = (turma: Turma) => {
    if (turma.capacidade_atual_da_turma > 0) {
      setSelectedTurma(turma)
      setIsModalOpen(true)
    } else {
      alert('Essa turma não possui alunos')
    }
  }

  const handleOpenPresencaSemanalModal = (turma: Turma) => {
    if (turma.capacidade_atual_da_turma > 0) {
      setSelectedTurma(turma)
      setIsPresencaSemanalModalOpen(true)
    } else {
      alert('Esta turma não possui alunos')
    }
  }

  const filteredTurmas = turmas.filter((turma) =>
    turma.nome_da_turma.toLowerCase().includes(searchTerm),
  )

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase())
  }

  useEffect(() => {
    fetchModalidades().then(setModalidades)
  }, [fetchModalidades])

  useEffect(() => {
    if (selectedModalidade) {
      const modalidadeEscolhida = modalidades.find(
        (modalidade) => modalidade.nome === selectedModalidade,
      )
      setTurmas(modalidadeEscolhida ? modalidadeEscolhida.turmas : [])
    }
  }, [selectedModalidade, modalidades])

  const handleModalidadeChange = (event: SelectChangeEvent<string>) => {
    setSelectedModalidade(event.target.value)
  }
  return (
    <Box sx={BoxStyleCadastro}>
      <Typography sx={TituloSecaoStyle}>
        Informações Gerais das Turmas
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="modalidade-select-label">Modalidade</InputLabel>
        <Select
          labelId="modalidade-select-label"
          id="modalidade-select"
          value={selectedModalidade}
          label="Modalidade"
          onChange={handleModalidadeChange}
        >
          {modalidades.map((modalidade) => (
            <MenuItem key={modalidade.nome} value={modalidade.nome}>
              {modalidade.nome}
            </MenuItem>
          ))}
        </Select>
        <TextField
          label="Pesquisar pelo nome da turma"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          margin="normal"
        />
      </FormControl>
      <Divider sx={{ my: 2 }} />
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Nome da Turma</TableCell>
              <TableCell>Núcleo</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Capacidade Máxima</TableCell>
              <TableCell>Capacidade Atual</TableCell>
              <TableCell>Presença Semanal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTurmas.map((turma) => (
              <TableRow
                key={turma.nome_da_turma}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  onClick={() => handleOpenModal(turma)}
                >
                  {turma.nome_da_turma}
                </TableCell>
                <TableCell>{turma.nucleo}</TableCell>
                <TableCell>{turma.categoria}</TableCell>
                <TableCell>{turma.capacidade_maxima_da_turma}</TableCell>
                <TableCell>{turma.capacidade_atual_da_turma}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenPresencaSemanalModal(turma)}
                  >
                    Abrir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedTurma && (
        <ControleFrequenciaTableNoSSR
          alunosDaTurma={selectedTurma.alunos}
          nomeDaTurma={selectedTurma.nome_da_turma}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {selectedTurma && isPresencaSemanalModalOpen && (
        <TurmaPresencaSemanal
          alunosDaTurma={selectedTurma.alunos}
          nomeDaTurma={selectedTurma.nome_da_turma}
          isOpen={isPresencaSemanalModalOpen}
          onClose={() => setIsPresencaSemanalModalOpen(false)}
        />
      )}
    </Box>
  )
}
// update
