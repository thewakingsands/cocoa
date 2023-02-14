FROM node:16 AS builder
WORKDIR /app
COPY . /app
RUN yarn && yarn build && yarn workspaces focus -A --production

FROM node:16-slim
WORKDIR /app
COPY --from=builder /app /app
CMD ["node", "-r", "./.pnp.cjs", "dist/src"]
