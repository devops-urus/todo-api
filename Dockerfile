# In Dockerfile

# ---- Base Stage ----
# Start with an official Node.js image.
FROM node:18-alpine AS base
WORKDIR /usr/src/app

# ---- Dependencies Stage ----
# This stage is for installing dependencies. It's separate so Docker can cache them.
FROM base AS dependencies
COPY package*.json ./
RUN npm install

# ---- Build Stage ----
# This stage builds our TypeScript code into JavaScript.
FROM base AS build
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
# Run the Prisma generate command before building
RUN npx prisma generate
RUN npm run build

# ---- Production Stage ----
# This is the final, small, and optimized image we will run.
FROM base AS production
ENV NODE_ENV=production
# Copy only the production dependencies, not the devDependencies.
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
# Copy the compiled JavaScript code from the build stage.
COPY --from=build /usr/src/app/dist ./dist
# Copy the Prisma schema needed to run the client.
COPY --from=build /usr/src/app/prisma ./prisma

# The command to start our application.
CMD ["node", "dist/index.js"]