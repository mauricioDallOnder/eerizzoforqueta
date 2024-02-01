import { AttendanceModalContentProps } from "@/interface/interfaces";
import { Box, Typography } from "@mui/material";

export const ListaDeChamadaModal: React.FC<AttendanceModalContentProps> = ({ aluno, month }) => {
    const presencas = aluno.presencas[month];
    const totalDias = Object.keys(presencas).length;
    const totalPresencas = Object.values(presencas).filter(present => present).length;
    const totalAusencias = totalDias - totalPresencas;
  
    return (
      <Box>
        <Typography id="modal-title" variant="h6" component="h2" sx={{ textAlign: "center", marginBottom: '16px' }}>
          {aluno.nome} <br /> {month}/2024
        </Typography>
        <Box
          id="modal-description"
          sx={{
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          {Object.entries(presencas).map(([day, present]) => (
            <Typography key={day} sx={{ borderBottom: '1px solid #ddd', padding: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{day}</span>
              <span>{present ? 'Presente' : 'Ausente'}</span>
            </Typography>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'center',alignItems:"center", marginTop: '16px', padding: '3px', borderTop: '1px solid #ddd',gap:"10px" }}>
            <Typography>Total de Presenças: {totalPresencas}</Typography>
            
            <Typography>Total de Ausências: {totalAusencias}</Typography>
          </Box>
        </Box>
      </Box>
    );
  };
  