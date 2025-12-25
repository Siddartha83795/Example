# Connecting Jenkins to Docker

This guide explains how to enable your Jenkins server to run Docker commands (like `docker build`) inside your pipelines.

## Prerequisites
1.  **Jenkins** is installed and running.
2.  **Docker** is installed on the same machine (or agent).

## Step 1: Permission Setup (Crucial)
The most common issue is that the `jenkins` user doesn't have permission to write to the Docker socket.

Run the following commands on your Jenkins server:

```bash
# 1. Add the 'jenkins' user to the 'docker' group
sudo usermod -aG docker jenkins

# 2. Restart Jenkins to apply the group change
sudo systemctl restart jenkins
```

> **Note:** If you are running Jenkins **inside a Docker container**, you must mount the host's Docker socket when starting the container:
>
> `docker run -p 8080:8080 -v /var/run/docker.sock:/var/run/docker.sock ...`
>
> You may also need to change permissions on the socket: `sudo chmod 666 /var/run/docker.sock` (Use with caution in production).

## Step 2: Install Jenkins Docker Plugins
To use advanced features (like "Docker Agents"), install the necessary plugins:

1.  Go to **Manage Jenkins** > **Plugins** > **Available plugins**.
2.  Search for **"Docker Pipeline"** and **"Docker"**.
3.  Install them and restart Jenkins.

## Step 3: Verify with your Jenkinsfile
Your current `Jenkinsfile` already has a Docker stage:

```groovy
stage('Docker Build') {
    steps {
        script {
            def appName = "vite-react-shadcn-ts"
            sh "docker build -t ${appName} ."
        }
    }
}
```

If the permissions (Step 1) are correct, this stage will succeed.

### Troubleshooting
**Error:** `Got permission denied while trying to connect to the Docker daemon socket`
*   **Fix:** Re-run Step 1 and ensure you restarted Jenkins.

**Error:** `docker: command not found`
*   **Fix:** Ensure Docker is installed on the machine running Jenkins (`sudo apt install docker.io`).
