# Use the official Node.js image as the base image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application to the working directory
COPY . .

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD [ "node", "index.js" ]
