import React, { useContext } from 'react';
import { Button } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DataContext } from "@/context/context";
import { Modalidade } from '@/interface/interfaces';

const ExportFaltasSemestre: React.FC = () => {
    const { modalidades } = useContext(DataContext);

    const handleExport = () => {
        const workbook = XLSX.utils.book_new();
        const sheetNameCount: { [key: string]: number } = {};

        modalidades.forEach((modalidade: Modalidade) => {
            modalidade.turmas.forEach((turma) => {
                const sheetData: any[][] = []; // Matriz de matrizes

                const header = ['Nome','fevereiro', 'março', 'abril', 'maio', 'junho'];
                const title = [`Total de faltas mês a mês do período (${header.slice(1).join(', ')})`];
                sheetData.push(title);
                sheetData.push(header);

                turma.alunos.forEach((aluno) => {
                    if (aluno && aluno.presencas) {
                        const presencasPorMes: { [key: string]: any } = {};

                        for (const mes of header.slice(2)) {
                            if (aluno.presencas[mes]) {
                                const faltas = Object.values(aluno.presencas[mes]).filter(presenca => !presenca).length;
                                presencasPorMes[mes] = faltas;
                            } else {
                                presencasPorMes[mes] = 0;
                            }
                        }

                        sheetData.push([
                            aluno.nome,
                            ...header.slice(2).map(mes => presencasPorMes[mes] ?? 0)
                        ]);
                    }
                });

                const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

                // Truncate sheet name to 28 characters and add unique suffix if necessary
                let sheetName = `${modalidade.nome} - ${turma.nome_da_turma}`;
                let truncatedSheetName = sheetName.length > 31 ? sheetName.slice(0, 28) + '...' : sheetName;

                if (sheetNameCount[truncatedSheetName]) {
                    sheetNameCount[truncatedSheetName] += 1;
                    truncatedSheetName = `${truncatedSheetName.slice(0, 25)}...${sheetNameCount[truncatedSheetName]}`;
                } else {
                    sheetNameCount[truncatedSheetName] = 1;
                }

                XLSX.utils.book_append_sheet(workbook, worksheet, truncatedSheetName);
            });
        });

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'FaltasDoSemestre.xlsx');
    };

    return (
        <Button variant="contained" color="warning" onClick={handleExport} sx={{width:"90%",marginLeft:"16px"}}>
            Exportar os registros de frequencia do semestre
        </Button>
    );
};

export default ExportFaltasSemestre;
