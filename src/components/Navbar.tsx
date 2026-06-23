"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "맵", href: "/graph" },
  { label: "글 목록", href: "/posts" },
  { label: "복습", href: "/review" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <AppBar position="static" sx={{ background: "#111", borderBottom: "1px solid #222" }} elevation={0}>
      <Toolbar variant="dense" sx={{ gap: 2 }}>
        <Typography
          component={Link}
          href="/"
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "#fff", textDecoration: "none", mr: 2 }}
        >
          playground
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.href}
              component={Link}
              href={item.href}
              size="small"
              sx={{
                color: pathname === item.href ? "#fff" : "#888",
                fontWeight: pathname === item.href ? 700 : 400,
                "&:hover": { color: "#fff" },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
