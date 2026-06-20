import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionToken } from "@/lib/auth";
import { Box, Button, Container, TextField, Typography } from "@mui/material";

async function login(formData: FormData) {
  "use server";
  const password = String(formData.get("password"));
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_token", await getSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: "/",
    });
    redirect("/admin");
  }
}

export default function LoginPage() {
  return (
    <Container maxWidth="xs" sx={{ py: 12 }}>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>
        Admin
      </Typography>
      <form action={login}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            name="password"
            type="password"
            label="비밀번호"
            required
            fullWidth
            autoFocus
          />
          <Button type="submit" variant="contained" fullWidth>
            로그인
          </Button>
        </Box>
      </form>
    </Container>
  );
}
