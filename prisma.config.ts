import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const config = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
  migrations: {
    path: "prisma/migrations",
  },
});

export default config;
