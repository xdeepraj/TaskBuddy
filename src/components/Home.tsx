import { useAuth } from "../context/AuthContext";
import { Button, Box, Typography, Container, Stack } from "@mui/material";
import GoogleIcon from "../assets/google-icon.svg";
import ColorIcon from "../assets/color-icon.svg";

import Dashboard from "./Dashboard";

const Home = () => {
  const { user, loginWithGoogle } = useAuth();

  const dashboardView = new URL("../assets/dashboard-view.JPG", import.meta.url)
    .href;

  return (
    <Container maxWidth={false} sx={{ overflow: "hidden" }} disableGutters>
      {user ? (
        <Dashboard />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {/* Left Side */}
          <Box
            sx={{
              flex: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <Stack sx={{ px: 10 }}>
              <Box
                sx={{
                  display: "flex",
                  mb: 1,
                }}
              >
                <img
                  src={ColorIcon}
                  alt="Main Icon"
                  style={{ width: 50, height: 50 }}
                />
                <Typography
                  variant="body1"
                  color="primary"
                  fontSize="36px"
                  fontWeight="600"
                >
                  TaskBuddy
                </Typography>
              </Box>

              <Box sx={{ mb: 4, pl: 1 }}>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  fontSize="12px"
                  fontWeight="600"
                >
                  Streamline your workflow and track progress effortlessly
                  <br />
                  with our all-in-one task management app.
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                onClick={loginWithGoogle}
                sx={{
                  backgroundColor: "#292929",
                  fontFamily: "'Urbanist', sans-serif",
                  fontSize: "22px",
                  px: 8,
                  py: 2,

                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <img
                  src={GoogleIcon}
                  alt="Google Icon"
                  style={{ width: 24, height: 24 }}
                />
                Continue with Google
              </Button>
            </Stack>
          </Box>

          {/* Right Side */}
          <Box
            sx={{
              position: "relative",
              width: "100vw",
              height: "100vh",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 5,
            }}
          >
            {/* Outer Circle */}
            <Box
              sx={{
                position: "absolute",
                width: "50vw",
                height: "50vw",
                border: "1px solid",
                borderColor: "primary.main",
                borderRadius: "50%",
                zIndex: 1,
              }}
            />
            {/* Middle Circle */}
            <Box
              sx={{
                position: "absolute",
                width: "40vw",
                height: "40vw",
                border: "2px solid",
                borderColor: "primary.main",
                borderRadius: "50%",
                zIndex: 2,
              }}
            />
            {/* Inner Circle */}
            <Box
              sx={{
                position: "absolute",
                width: "30vw",
                height: "30vw",
                border: "3px solid",
                borderColor: "primary.main",
                borderRadius: "50%",
                zIndex: 3,
              }}
            />
            <img
              src={dashboardView}
              alt="Dashboard View"
              style={{
                position: "absolute",
                left: 150,
                width: "90vw",
                zIndex: 4,
                boxShadow: "10px 10px 40px rgba(0, 0, 0, 0.3)",
                borderRadius: "15px",
              }}
            />
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Home;
