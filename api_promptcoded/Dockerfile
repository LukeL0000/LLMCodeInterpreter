# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=20.15.0

FROM node:${NODE_VERSION}-alpine

# Create a new user 'admin'
RUN adduser -D admin

# Use production node environment by default.
ENV NODE_ENV production

COPY . /usr/src/app
WORKDIR /usr/src/app

# Change ownership of the working directory to 'admin'
RUN chown -R admin:admin /usr/src/app

# Ensure appropriate permissions for the working directory
RUN chmod 755 /usr/src/app

# Switch to the 'admin' user
USER admin

# Copy package.json and package-lock.json to the working directory
# Leverage Docker's caching mechanism with bind mounts and npm cache
RUN npm uninstall \
    npm install 

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 9000

# Run the application.
CMD ["npm", "start"]
