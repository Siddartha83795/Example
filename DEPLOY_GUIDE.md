# Deployment Guide

This guide covers how to run the application locally using Docker and how to deploy it to an Amazon EC2 instance.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Deployment (Docker)](#local-deployment-docker)
3. [EC2 Deployment](#ec2-deployment)

## Prerequisites

- **Docker**: Installed on your local machine.
- **AWS Account**: Access to launch EC2 instances.
- **SSH Client**: To connect to the EC2 instance.

## Local Deployment (Docker)

To build and run the application container locally:

1.  **Build the Docker Image**:
    ```bash
    docker build -t vite-react-app .
    ```

2.  **Run the Container**:
    ```bash
    docker run -d -p 8080:80 vite-react-app
    ```

3.  **Access the Application**:
    Open your browser and navigate to `http://localhost:8080`.

## EC2 Deployment

### 1. Launch an EC2 Instance

1.  Log in to the AWS Management Console.
2.  Navigate to **EC2** and click **Launch Instance**.
3.  **Name**: `QuickServeHub`
4.  **OS Image**: `Amazon Linux 2023 AMI` (or Ubuntu).
5.  **Instance Type**: `t2.micro` (Free tier eligible).
6.  **Key Pair**: Create a new one or select an existing one (save the `.pem` file safely).
7.  **Network Settings**:
    - Allow SSH traffic from your IP.
    - **Important**: Check "Allow HTTP traffic from the internet".
    - **Important**: Check "Allow HTTPS traffic from the internet".

### 2. Connect to EC2

Open your terminal and SSH into the instance:

```bash
chmod 400 your-key-pair.pem
ssh -i "your-key-pair.pem" ec2-user@<your-ec2-public-ip>
```

### 3. Install Docker on EC2

Run the following commands on your EC2 instance:

```bash
# Update installed packages
sudo dnf update -y

# Install Docker
sudo dnf install docker -y

# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Add your user to the docker group (avoids using sudo for docker commands)
sudo usermod -aG docker ec2-user
```

*Log out and log back in for the group changes to take effect.*

```bash
exit
ssh -i "your-key-pair.pem" ec2-user@<your-ec2-public-ip>
```

### 4. Deploy the Application

There are two main ways to get your code onto the EC2 instance:

#### Option A: Clone from Git (Recommended for testing)

1.  **Install Git**:
    ```bash
    sudo dnf install git -y
    ```
2.  **Clone the Repository**:
    ```bash
    git clone <your-repo-url>
    cd quickserve-hub
    ```
3.  **Build and Run**:
    ```bash
    docker build -t app .
    docker run -d -p 80:80 app
    ```

#### Option B: Use a Container Registry (Production approach)
*Push your image to Docker Hub or Amazon ECR from your local machine, then pull it on EC2.*

**On Local Machine:**
```bash
docker tag vite-react-app your-dockerhub-username/vite-react-app
docker push your-dockerhub-username/vite-react-app
```

**On EC2:**
```bash
docker run -d -p 80:80 your-dockerhub-username/vite-react-app
```

### 5. Access the Public App

1.  Copy the **Public IPv4 address** or **Public IPv4 DNS** of your EC2 instance from the AWS Console.
2.  Paste it into your browser.

**Note**: If the site doesn't load, ensure your **Security Group** allows Inbound traffic on **Port 80 (HTTP)** from `0.0.0.0/0`.
