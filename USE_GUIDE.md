How to install and deploy the project

IAC-UI Web Server: Installation and Build Guide
The IaC-UI web server is a powerful tool that provides a user-friendly interface web portal for the iacf solution. This guide will walk you through the various methods of deploying and building the IaC-UI web server, ensuring a seamless integration with your existing iacf ecosystem.

Option 1: Deploy the Pre-built Docker Image
For a quick and hassle-free deployment, you can leverage the pre-built Docker image available on Docker Hub. This option is ideal for environments where you have Docker installed and running, and you don't need to make any modifications to the IaC-UI web server codebase.

Pull the pre-built Docker image from Docker Hub:
docker pull iacf/iac-webserver:latest

Run the Docker container, mapping the desired host port to the container's port (default is 8000):

docker run -d -p 8000:8000 iacf/iac-webserver:latest

Please note that the IaC-UI web server is a front-end component that interacts with the IaC backend server. Ensure that the IaC backend server is running and configured to connect to the required databases (MySQL and MongoDB).

Option 2: Build from Source
If you need to customize the IaC-UI web server or integrate it with your existing Go-based applications, you can build it from source. This approach requires you to have Go (version 1.21 or higher) installed on your system.

Clone the IaC-UI repository from GitHub:

git clone https://github.com/iacf/iac-ui.git

Navigate to the project directory:

cd iac-ui

Build the IaC-UI web server:

go build

This command will produce an executable file (iac-ui or iac-ui.exe on Windows) that you can run directly on your system.

Option 3: Build Docker Image from Source
If you prefer to run the IaC-UI web server as a Docker container but want to build the image yourself, you can use the provided Dockerfile.

Clone the IaC-UI repository from GitHub:
git clone https://github.com/iacf/iac-ui.git

Navigate to the project directory:

cd iac-ui

Build the Docker image:

docker build -t iac-webserver:latest .

Run the Docker container, mapping the desired host port to the container's port (default is 8000):

docker run -d -p 8000:8000 iac-webserver:latest

Option 4: Build with Docker Compose
For a more comprehensive deployment that includes the IaC-UI web server and other required components (e.g., IaC backend server, databases), you can leverage Docker Compose. This approach ensures a consistent and reproducible deployment across different environments.

Clone the IaCF repository from GitHub:

git clone https://github.com/iacf/iacf.git

Navigate to the repository directory:

cd iacf

Build and run the Docker containers using Docker Compose:

docker-compose up -d

This command will build and start the necessary containers, including the IaC-UI web server, IaC backend server, and required databases, based on the configurations defined in the docker-compose.yaml file.

Regardless of the deployment method you choose, make sure to refer to the IaCF documentation for detailed configuration instructions, including setting up the required database connections and any other necessary integrations.

By following this guide, you'll be able to seamlessly deploy and build the IaC-UI web server, enabling a user-friendly interface for managing your infrastructure as code solution.
