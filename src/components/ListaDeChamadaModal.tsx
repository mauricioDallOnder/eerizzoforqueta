import { AttendanceModalContentProps } from "@/interface/interfaces";
import { Box, Typography, Avatar } from "@mui/material";
import Image from "next/image";
export const ListaDeChamadaModal: React.FC<AttendanceModalContentProps> = ({
  aluno,
  month,
}) => {
  const presencas = aluno.presencas[month];
  const totalDias = Object.keys(presencas).length;
  const totalPresencas = Object.values(presencas).filter(
    (present) => present
  ).length;
  const totalAusencias = totalDias - totalPresencas;

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Typography
        id="modal-title"
        variant="h6"
        component="h2"
        sx={{ textAlign: "center", marginBottom: "16px" }}
      >
        {aluno.nome} <br /> {month}/2024
      </Typography>
      <Avatar
        sx={{
          width: 80, // tamanho do Avatar
          height: 80, // tamanho do Avatar
          // boxShadow: 'none' // Descomente se necessário
          backgroundColor: "white",
          marginTop: "5px",
          marginBottom: "5px",
        }}
      >
        <img
          src={aluno.foto!}
          alt="Avatar"
          style={{
            width: "100%", // Isso fará com que a imagem preencha a largura da caixa
            height: "100%", // Isso fará com que a imagem preencha a altura da caixa
            objectFit: "cover", // Isso fará com que a imagem cubra todo o espaço disponível, cortando o excesso
          }}
        />
      </Avatar>
      <Box
        id="modal-description"
        sx={{
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        {Object.entries(presencas).map(([day, present]) => (
          <Typography
            key={day}
            sx={{
              borderBottom: "1px solid #ddd",
              padding: "8px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{day}</span>
            <span>{present ? "Presente" : "Ausente"}</span>
          </Typography>
        ))}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "16px",
            padding: "3px",
            borderTop: "1px solid #ddd",
            gap: "10px",
          }}
        >
          <Typography>Total de Presenças: {totalPresencas}</Typography>

          <Typography>Total de Ausências: {totalAusencias}</Typography>
        </Box>
      </Box>
    </Box>
  );
};
