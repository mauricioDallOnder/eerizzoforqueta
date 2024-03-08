/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as React from 'react'
import {
  DataGrid,
  GridColDef,
  GridCsvExportOptions,
  GridCsvGetRowsToExportParams,
  GridRowsProp,
  GridToolbar,
  gridExpandedSortedRowIdsSelector,
  gridPageCountSelector,
  gridPageSelector,
  gridPaginatedVisibleSortedGridRowIdsSelector,
  gridSortedRowIdsSelector,
  useGridApiContext,
  useGridSelector,
} from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import { useData } from '@/context/context'
import { useEffect, useState } from 'react'
import { Aluno } from '@/interface/interfaces'
import { v4 as uuidv4 } from 'uuid'
import { Button, ButtonProps, Container, createSvgIcon } from '@mui/material'
import DownloadingIcon from '@mui/icons-material/Downloading'
import Layout from '@/components/TopBarComponents/Layout'
const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: 0,
  color: theme.palette.text.primary, // Texto com cor primária do tema
  fontFamily: theme.typography.fontFamily, // Fonte do tema
  WebkitFontSmoothing: 'auto',
  letterSpacing: 'normal',
  backgroundColor: theme.palette.text.secondary,
  // Ajustando a cor de fundo dos cabeçalhos para se adequar ao design do seu site
  '& .MuiDataGrid-columnsContainer': {
    backgroundColor: '#4a4a4a', // Cor mais escura para o cabeçalho
    color: '#ffffff', // Texto do cabeçalho em branco para contraste
  },
  '& .MuiDataGrid-iconSeparator': {
    display: 'none',
  },
  // As bordas das células agora são mais visíveis
  '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
    borderRight: `1px solid ${theme.palette.divider}`, // Borda à direita das células
    backgroundColor: 'white', // Efeito ao passar o mouse
  },
  '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
    borderBottom: `1px solid ${theme.palette.divider}`, // Borda inferior das células
  },
  // Cor de fundo das células para diferenciar do fundo do site
  '& .MuiDataGrid-cell': {
    color: theme.palette.text.secondary, // Cor do texto das células do tema
    backgroundColor: '#e0e0e0', // Cor de fundo clara para as células
  },
  // Ajuste nos botões de paginação
  '& .MuiPaginationItem-root': {
    borderRadius: 0, // Botões de paginação sem bordas arredondadas
  },
  '& .MuiInputBase-input': {
    color: 'white',
  },

  // Aqui você pode adicionar outras personalizações específicas como o estilo customizado para checkbox
}))

function CustomPagination() {
  const apiRef = useGridApiContext()
  const page = useGridSelector(apiRef, gridPageSelector)
  const pageCount = useGridSelector(apiRef, gridPageCountSelector)

  const getFilteredRows = ({ apiRef }: GridCsvGetRowsToExportParams) =>
    gridExpandedSortedRowIdsSelector(apiRef)

  const handleExport = (options: GridCsvExportOptions) =>
    apiRef.current.exportDataAsCsv(options)

  return (
    <>
      <Pagination
        color="primary"
        variant="outlined"
        shape="rounded"
        page={page + 1}
        count={pageCount}
        // @ts-expect-error
        renderItem={(props2) => <PaginationItem {...props2} disableRipple />}
        onChange={(event: React.ChangeEvent<unknown>, value: number) =>
          apiRef.current.setPage(value - 1)
        }
      />

      <Button
        onClick={() => handleExport({ getRowsToExport: getFilteredRows })}
        sx={{ gap: '2px', display: 'flex', alignItems: 'center' }}
        variant="contained"
        color="secondary"
      >
        <DownloadingIcon />
        Export Filtered rows
      </Button>
    </>
  )
}

const PAGE_SIZE = 15
export default function ExportStudentDataToExcel() {
  const { fetchModalidades } = useData()
  const [alunosComTurma, setAlunosComTurma] = useState<
    {
      aluno: Aluno
      nomeDaTurma: string
      categoria: string
      modalidade: string
    }[]
  >([])

  useEffect(() => {
    fetchModalidades().then((modalidadesFetched) => {
      // Filtra as modalidades para excluir 'temporários', 'arquivados' e 'excluídos'
      const modalidadesValidas = modalidadesFetched.filter(
        (modalidade) =>
          modalidade.nome.toLowerCase() !== 'temporarios' &&
          modalidade.nome.toLowerCase() !== 'arquivados' &&
          modalidade.nome.toLowerCase() !== 'excluidos',
      )

      // Mapeia as modalidades válidas para extrair os alunos
      const alunosComTurmaTemp = modalidadesValidas.flatMap((modalidade) =>
        modalidade.turmas.flatMap((turma) => {
          const alunosArray = Array.isArray(turma.alunos) ? turma.alunos : []
          return alunosArray.filter(Boolean).map((aluno) => ({
            aluno,
            nomeDaTurma: turma.nome_da_turma,
            categoria: turma.categoria,
            modalidade: turma.modalidade,
          }))
        }),
      )

      setAlunosComTurma(alunosComTurmaTemp)
    })
  }, [fetchModalidades])

  const [paginationModel, setPaginationModel] = useState({
    pageSize: PAGE_SIZE,
    page: 0,
  })
  const alunoIdMap = new Map()

  const rows: GridRowsProp = alunosComTurma.map(
    ({ aluno, nomeDaTurma, categoria, modalidade }) => {
      // Verifica se o aluno já foi adicionado, se sim, gera um UUID
      const alunoId = aluno.id.toString()
      if (alunoIdMap.has(alunoId)) {
        return {
          id: uuidv4(),
          col1: aluno.nome,
          col2: nomeDaTurma,
          col3: categoria,
          col4: modalidade,
        }
      } else {
        // Se não foi adicionado, usa o ID do aluno e marca como adicionado
        alunoIdMap.set(alunoId, true)
        return {
          id: alunoId,
          col1: aluno.nome,
          col2: nomeDaTurma,
          col3: categoria,
          col4: modalidade,
        }
      }
    },
  )

  const columns: GridColDef[] = [
    { field: 'col1', headerName: 'Nome', width: 250 },
    { field: 'col2', headerName: 'Turma', width: 250 },
    { field: 'col3', headerName: 'Núcleo', width: 250 },
    { field: 'col4', headerName: 'Modalidade', width: 250 },
  ]

  return (
    <>
      <Layout>
        <Container
          style={{ marginTop: '10px', height: 'auto', width: 'fit-content' }}
        >
          <StyledDataGrid
            checkboxSelection
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[PAGE_SIZE]}
            slots={{
              pagination: CustomPagination,
              toolbar: GridToolbar,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            rows={rows}
            columns={columns}
          />
        </Container>
      </Layout>
    </>
  )
}

/*
   <div style={{ height: 300, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        slots={{
          pagination: CustomPagination,
          toolbar: GridToolbar,
        }}
      />
    </div>
*/
