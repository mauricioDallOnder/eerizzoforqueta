import * as React from "react";
import {
    DataGrid,
    GridColDef,
    GridCsvExportOptions,
    GridCsvGetRowsToExportParams,
    GridRowId,
    GridRowsProp,
    GridToolbar,
    useGridApiContext,
    useGridSelector,
    gridPageSelector,
    gridPageCountSelector,
    gridExpandedSortedRowIdsSelector,
    GridCellParams
} from "@mui/x-data-grid";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import { useData } from "@/context/context";
import { useEffect, useState } from "react";
import { AlunoComTurma } from "@/interface/interfaces";
import { v4 as uuidv4 } from "uuid";
import { Avatar, Button, Container, Dialog, DialogContent, DialogTitle, IconButton, Box, Snackbar, Alert } from "@mui/material";
import DownloadingIcon from "@mui/icons-material/Downloading";
import CloseIcon from '@mui/icons-material/Close';
import ResponsiveAppBar from "@/components/TopBarComponents/TopBar";
import { StyledDataGrid } from "@/utils/Styles";
import { useCopyToClipboard } from "@/hooks/CopyToClipboardHook";

const normalizeText = (text: any): string => {
    return text ? String(text).trim() : "";
};

function CustomPagination() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    const getFilteredRows = ({ apiRef }: GridCsvGetRowsToExportParams) =>
        gridExpandedSortedRowIdsSelector(apiRef);

    const handleExport = (options: GridCsvExportOptions) =>
        apiRef.current.exportDataAsCsv(options);

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
                sx={{ gap: "2px", display: "flex", alignItems: "center" }}
                variant="contained"
                color="secondary"
            >
                <DownloadingIcon />
                Exportar colunas selecionadas
            </Button>
        </>
    );
}

const PAGE_SIZE = 30;

export default function StudantTableGeral() {
    const { fetchModalidades } = useData();
    const [alunosComTurma, setAlunosComTurma] = useState<AlunoComTurma[]>([]);
    const [modifiedRows, setModifiedRows] = useState<Record<GridRowId, AlunoComTurma>>({});
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [copiedText, copyToClipboard] = useCopyToClipboard();
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        fetchModalidades().then((modalidadesFetched) => {
            const modalidadesValidas = modalidadesFetched.filter(
                (modalidade) => !["temporarios", "arquivados", "excluidos"].includes(modalidade.nome.toLowerCase())
            );

            const alunosComTurmaTemp: AlunoComTurma[] = modalidadesValidas.flatMap((modalidade) =>
                modalidade.turmas.flatMap((turma) => {
                    const alunosArray = Array.isArray(turma.alunos) ? turma.alunos : [];
                    return alunosArray.filter(Boolean).map((aluno): AlunoComTurma => ({
                        aluno: {
                            ...aluno,
                            informacoesAdicionais: {
                                ...aluno.informacoesAdicionais,
                                IdentificadorUnico: aluno.informacoesAdicionais?.IdentificadorUnico ?? uuidv4(),
                            },
                        },
                        nomeDaTurma: turma.nome_da_turma,
                        categoria: turma.categoria,
                        modalidade: turma.modalidade,
                        uniforme: aluno.informacoesAdicionais?.hasUniforme ?? false,
                    }));
                })
            );

            setAlunosComTurma(alunosComTurmaTemp);
        });
    }, [fetchModalidades]);

    const handleClose = () => {
        setSelectedPhoto(null);
    };

    const handlePhotoClick = (photoUrl: string) => {
        setSelectedPhoto(photoUrl);
    };

    const handleCellClick = async (params: GridCellParams) => {
        const cellContent = params.value ? String(params.value) : '';
        const success = await copyToClipboard(cellContent);
        if (success) {
            console.log(`Text "${cellContent}" copied to clipboard successfully.`);
            setOpenSnackbar(true);
        } else {
            console.error('Failed to copy text to clipboard.');
        }
    };

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    const [paginationModel, setPaginationModel] = useState({
        pageSize: PAGE_SIZE,
        page: 0,
    });

    const rows: GridRowsProp = alunosComTurma.map(
        ({ aluno, nomeDaTurma, categoria, modalidade }) => {
            return {
                id: aluno.informacoesAdicionais?.IdentificadorUnico ?? uuidv4(),
                foto: aluno.foto,
                nome: aluno.nome,
                anoNascimento: aluno.anoNascimento,
                dataMatricula: aluno.dataMatricula == undefined ? "-" : normalizeText(String(aluno.dataMatricula)),
                rg: aluno.informacoesAdicionais ? normalizeText(aluno.informacoesAdicionais.rg) : "-",
                uniforme: aluno.informacoesAdicionais ? normalizeText(aluno.informacoesAdicionais.uniforme) : "-",
                telefoneComWhatsapp: aluno.telefoneComWhatsapp == undefined ? "-" : normalizeText(String(aluno.telefoneComWhatsapp)),
                turma: nomeDaTurma,
                irmaos: aluno.informacoesAdicionais ? normalizeText(aluno.informacoesAdicionais.irmaos) : "-",
                nomefuncionarioJBS: aluno.informacoesAdicionais ? normalizeText(aluno.informacoesAdicionais.nomefuncionarioJBS) : "-",
                nomefuncionariomarcopolo: aluno.informacoesAdicionais ? normalizeText(aluno.informacoesAdicionais.nomefuncionariomarcopolo) : "-",
                endereco: aluno.informacoesAdicionais && aluno.informacoesAdicionais.endereco ? normalizeText(aluno.informacoesAdicionais.endereco.ruaAvenida) : "-",
                bairro: aluno.informacoesAdicionais && aluno.informacoesAdicionais.endereco?.bairro ? normalizeText(aluno.informacoesAdicionais.endereco?.bairro) : "-",
                numerocasa: aluno.informacoesAdicionais && aluno.informacoesAdicionais.endereco?.numeroResidencia ? normalizeText(aluno.informacoesAdicionais.endereco?.numeroResidencia) : "-",
                cep: aluno.informacoesAdicionais && aluno.informacoesAdicionais.endereco?.cep ? normalizeText(aluno.informacoesAdicionais.endereco?.cep) : "-",
                pagadorMensalidadesNome: aluno.informacoesAdicionais ? normalizeText(aluno.informacoesAdicionais.pagadorMensalidades?.nomeCompleto) : "-",
                pagadorMensalidadesCpf: aluno.informacoesAdicionais ? normalizeText(String(aluno.informacoesAdicionais.pagadorMensalidades?.cpf)) : "-",
                pagadorMensalidadesEmail: aluno.informacoesAdicionais ? normalizeText(aluno.informacoesAdicionais.pagadorMensalidades?.email) : "-",
                pagadorMensalidadesCelular: aluno.informacoesAdicionais ? normalizeText(String(aluno.informacoesAdicionais.pagadorMensalidades?.celularWhatsapp)) : "-",
            };
        }
    );

    const mergedRows = rows.map(row => ({
        ...row,
        ...(modifiedRows[row.id] ? { uniforme: modifiedRows[row.id].uniforme } : {})
    }));

    const columns: GridColDef[] = [
        {
            field: "foto",
            headerName: "Foto",
            width: 70,
            renderCell: (params) => (
                <Avatar
                    src={params.value}
                    sx={{
                        backgroundColor: "white",
                        marginTop: "5px",
                        marginBottom: "5px", cursor: "pointer"
                    }}
                    onClick={() => handlePhotoClick(params.value)}
                />
            ),
        },
        { field: "nome", headerName: "Nome", width: 250, cellClassName: 'cell-wrap' },
        { field: "anoNascimento", headerName: "Nascimento", width: 100, cellClassName: 'cell-wrap' },
        { field: "dataMatricula", headerName: "Data de Matrícula", width: 150, cellClassName: 'cell-wrap' },
        { field: "rg", headerName: "RG", width: 200, cellClassName: 'cell-wrap' },
        { field: "uniforme", headerName: "Uniforme", width: 100, cellClassName: 'cell-wrap' },
        { field: "telefoneComWhatsapp", headerName: "Telefone com WhatsApp", width: 250, cellClassName: 'cell-wrap' },
        { field: "turma", headerName: "Turma", width: 250, cellClassName: 'cell-wrap' },
        { field: "irmaos", headerName: "Irmãos", width: 150, cellClassName: 'cell-wrap' },
        { field: "nomefuncionarioJBS", headerName: "Funcionário JBS", width: 150, cellClassName: 'cell-wrap' },
        { field: "nomefuncionariomarcopolo", headerName: "Funcionário Marcopolo", width: 180, cellClassName: 'cell-wrap' },
        { field: "endereco", headerName: "Endereço", width: 250, cellClassName: 'cell-wrap' },
        { field: "bairro", headerName: "Bairro", width: 250, cellClassName: 'cell-wrap' },
        { field: "numerocasa", headerName: "Nº", width: 80, cellClassName: 'cell-wrap' },
        { field: "cep", headerName: "CEP", width: 150, cellClassName: 'cell-wrap' },
        { field: "pagadorMensalidadesNome", headerName: "Pagador de Mensalidades", width: 250, cellClassName: 'cell-wrap' },
        { field: "pagadorMensalidadesCpf", headerName: "CPF do Pagador", width: 200, cellClassName: 'cell-wrap' },
        { field: "pagadorMensalidadesEmail", headerName: "Email do Pagador", width: 250, cellClassName: 'cell-wrap' },
        { field: "pagadorMensalidadesCelular", headerName: "Celular do Pagador", width: 250, cellClassName: 'cell-wrap' },
    ];

    return (
        <>
            <ResponsiveAppBar />
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                <Box sx={{ height: 800, width: '95%', position: 'relative', marginTop: "10px" }}>
                    <StyledDataGrid
                        disableRowSelectionOnClick
                        checkboxSelection={false}
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
                        rows={mergedRows}
                        columns={columns}
                        onCellClick={handleCellClick}
                        sx={{
                            '& .MuiDataGrid-columnHeaders': {
                                position: 'sticky',
                                top: 0,
                                zIndex: 1,
                            },
                            '& .MuiDataGrid-cell': {
                                whiteSpace: 'normal',
                                wordWrap: 'break-word',
                                overflow: 'visible',
                            },
                        }}
                    />
                </Box>
                <Dialog open={!!selectedPhoto} onClose={handleClose} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <img src={selectedPhoto!} alt="Aluno" style={{ width: '100%' }} />
                    </DialogContent>
                </Dialog>
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={3000}
                    onClose={handleSnackbarClose}
                >
                    <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                        Conteúdo copiado com sucesso!
                    </Alert>
                </Snackbar>
            </Box>
        </>
    );
}
