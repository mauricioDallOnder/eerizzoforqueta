import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from '@mui/icons-material/Home';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import ListAltIcon from '@mui/icons-material/ListAlt';
import UpdateIcon from '@mui/icons-material/Update';
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { Avatar, Grid } from "@mui/material";
import { useData } from "@/context/context";
import { TurmasInfoTableNoSSR } from "@/components/AdminPageTable/DynamicComponents";
const drawerWidth = 240;
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

export default function AdminPage() {
  const { modalidades } = useData();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <Box>
      <Toolbar />
      <Avatar
        sx={{
          width: 80,
          height: 80,
          backgroundColor: "white",
          position: "absolute",
          top: "10px",
          left: "80px",
        }}
      >
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/imagens-9116b.appspot.com/o/logoescolinha-removebg-preview(1).png?alt=media&token=c33b14a0-c768-45a1-926f-94b85770f27b"
          alt=""
          layout="fill"
          objectFit="contain"
        />
      </Avatar>
      <Divider sx={{ my: 3 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary={<Link style={{ textDecoration: 'none', color: 'inherit' }} href="/">Página Inicial</Link>} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <GroupAddIcon />
            </ListItemIcon>
            <ListItemText primary={<Link style={{ textDecoration: 'none', color: 'inherit' }} href="/StudentRegistration">Cadastro de alunos</Link>} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary={<Link style={{ textDecoration: 'none', color: 'inherit' }} href="/StudentUpdateTurmas">Trocar turma de aluno</Link>} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider sx={{ my: 2 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <ListAltIcon />
            </ListItemIcon>
            <ListItemText primary={<Link style={{ textDecoration: 'none', color: 'inherit' }} href="/StudentPresenceTable">Lista de Chamada</Link>} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <UpdateIcon />
            </ListItemIcon>
            <ListItemText primary={<Link style={{ textDecoration: 'none', color: 'inherit' }} href="/StudentUpdatePersonalInformation">Atualização de dados cadastrais</Link>} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
  // Remove this const when copying and pasting into your project.
//StudentTemporary
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Painel de Administrador
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: "65px",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {/* Utilize o componente Grid para organizar os cartões em linha */}
        <Grid container spacing={2} justifyContent="center">
          {/* Cada cartão em um item de Grid */}

          <Box>
            <TurmasInfoTableNoSSR modalidades={modalidades} />
          </Box>
        </Grid>
        <Toolbar />
      </Box>
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // Se não tiver sessão ou não for admin, redirecione para a página de login
  if (!session || session.user.role !== "admin") {
    return {
      redirect: {
        destination: "/NotAllowPage",
        permanent: false,
      },
    };
  }

  // Retornar props aqui se a permissão for válida
  return { props: { /* props adicionais aqui */ } };
};