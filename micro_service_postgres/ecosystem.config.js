module.exports = {
  apps: [
    {
      name: "micro-service-postgres",
      script: "./dist/main.js",
      watch: true,
      env: {
        NODE_ENV: "dev",
      },
    },
  ],
};
