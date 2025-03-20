import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#7b1984",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#fff9f9",
    },
  },
  typography: {
    fontFamily: "'Mulish', 'Urbanist', sans-serif",
    button: {
      fontFamily: "'Mulish', sans-serif",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "20px",
        },
      },
    },
  },
});

export default theme;
