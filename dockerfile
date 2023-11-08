# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Build your TypeScript code
RUN npm run build

# Expose the port your application will listen on
EXPOSE 5000

# Define the command to start your application
CMD ["npm", "start"]