# In Dockerfile

# ---- Base Stage ----
# Start with an official Node.js image.
FROM node:18-alpine AS base
WORKDIR /usr/src/app

# ---- Dependencies Stage ----
# This stage is for installing ALL dependencies, including dev ones needed for the build.
FROM base AS dependencies
COPY package*.json ./
RUN npm install

# ---- Build Stage ----
# This stage builds our TypeScript code and generates the Prisma Client.
FROM base AS build
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
# Generate the Prisma Client code (writes to node_modules/@prisma/client)
RUN npx prisma generate
# Compile our TypeScript to JavaScript
RUN npm run build
# NEW: Remove development dependencies to shrink the final node_modules size
RUN npm prune --production

# ---- Production Stage ----
# This is the final, small, and optimized image we will run.
FROM base AS production
ENV NODE_ENV=production
# THE FIX: Copy the pruned node_modules from the 'build' stage, NOT the 'dependencies' stage.
# This ensures our generated Prisma Client is included.
COPY --from=build /usr/src/app/node_modules ./node_modules
# Copy the compiled JavaScript code from the build stage.
COPY --from=build /usr/src/app/dist ./dist
# Copy the Prisma schema needed by the client at runtime.
COPY --from=build /usr/src/app/prisma ./prisma

# The command to start our application.
CMD ["node", "dist/index.js"]