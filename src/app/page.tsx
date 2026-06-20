import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        background: "#0f0f0f",
        color: "#fff",
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: 700 }}>
        playground
      </Typography>
      <Typography variant="body1" color="grey.500">
        웹개발 학습 + 언어공부 기록
      </Typography>
      <Link href="/graph" style={{ textDecoration: "none" }}>
        <Button variant="contained" size="large">
          마인드맵 보기
        </Button>
      </Link>
    </Box>
  );
}
