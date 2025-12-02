import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { type Theme } from "@mui/material";
import { alpha, darken } from "@mui/material/styles";
import App from "./App";

import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");
const primaryMain = "#7008E7"; // purple
const secondaryMain = "#dc143c"; // crimson

const hoverDarken = 0.08;
const theme: Theme = createTheme({
  palette: {
    primary: {
      main: primaryMain,
      contrastText: "#ffffff",
    },
    secondary: {
      main: secondaryMain,
      contrastText: "#ffffff",
    },
    mode: "light",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          "& .MuiSvgIcon-root": {
            color: "inherit",
            transition: "color 150ms ease",
          },
        },
      },
      variants: [
        {
          props: { variant: "outlined", color: "primary" },
          style: {
            color: primaryMain,
            borderColor: primaryMain,
            borderWidth: "1px",
            '&:hover': {
              backgroundColor: alpha(primaryMain, 0.08),
            },
          },
        },
        {
          props: { variant: "contained", color: "primary" },
          style: {
            backgroundColor: primaryMain,
            color: "#ffffff",
            '&:hover': {
              backgroundColor: darken(primaryMain, hoverDarken),
            },
          },
        },
      ],
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: primaryMain,
          transition: "color 150ms ease",
          "&:hover": {
            color: darken(primaryMain, hoverDarken),
          },
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: primaryMain,
          transition: "color 150ms ease, background-color 150ms ease",
          "&:hover": {
            color: darken(primaryMain, hoverDarken),
            backgroundColor: alpha(primaryMain, 0.08),
          },
        }),
      },
    },
  },
});

// Expose a CSS variable for global use in inline SVGs and CSS
document.documentElement.style.setProperty("--iris-primary", primaryMain);
document.documentElement.style.setProperty("--iris-secondary", secondaryMain);

createRoot(container).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
