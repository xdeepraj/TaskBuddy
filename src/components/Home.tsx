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
              textAlign: { xs: "center", md: "left" },
              justifyContent: { xs: "flex-end", md: "center" },
            }}
          >
            <Stack
              sx={{
                px: { xs: 2, sm: 4, md: 10 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  mb: 1,
                  alignItems: "center",
                  justifyContent: { xs: "center", md: "flex-start" },
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
                  fontSize: { xs: "16px", md: "22px" },
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
            {/* Three Circle design*/}
            <Box
              sx={{
                position: "absolute",
                top: "20",
                left: "30",
                width: "50vw",
                height: "50vw",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
            </Box>

            {/* Dashboard Image*/}
            <Box
              sx={{
                position: "absolute",
                left: 150,
                width: "90vw",
                backgroundColor: "white",
                boxShadow: "10px 10px 40px rgba(0, 0, 0, 0.3)",
                borderRadius: "15px",
                display: { xs: "none", md: "block" },
                zIndex: 4,
              }}
            >
              <img
                src={dashboardView}
                alt="Dashboard View"
                style={{
                  width: "100%",
                  borderRadius: "15px",
                }}
              />
            </Box>

            {/* Three Circle design for mobile only*/}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                position: "fixed",
                top: -75,
                right: -75,
                width: "50vw",
                height: "50vw",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
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
            </Box>

            {/* Three Circle design for mobile only*/}
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                position: "fixed",
                top: 65,
                left: -120,
                width: "50vw",
                height: "50vw",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
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
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Home;
