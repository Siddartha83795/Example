# CD Secrets Setup Guide

To enable automated deployment, you must configure secrets in both GitHub and Jenkins.

## 1. Required Secrets
You will need the following information:
- **`EC2_HOST`**: The Public IP address of your EC2 instance.
- **`EC2_USER`**: The username for deployment (usually `ec2-user` or `ubuntu`).
- **`EC2_KEY`**: The content of your `.pem` SSH Private Key.

---

## 2. GitHub Actions Setup
1.  Go to your Repository on GitHub.
2.  Navigate to **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret**.
4.  Add `EC2_HOST`, `EC2_USER`, and `EC2_KEY`.

---

## 3. Jenkins Setup
1.  **SSH Key**:
    - Go to **Manage Jenkins** > **Credentials** > **System** > **Global credentials (unrestricted)**.
    - Click **Add Credentials**.
    - Kind: **SSH Username with private key**.
    - ID: `ec2-ssh-key`
    - Username: `ec2-user` (or your `EC2_USER` value)
    - Private Key: Select "Enter directly" and paste your `EC2_KEY` content.
2.  **Environment Variables**:
    - Go to **Manage Jenkins** > **System**.
    - Under **Global properties**, check **Environment variables**.
    - Add:
        - `EC2_HOST`: (Your EC2 IP)
        - `EC2_USER`: (Your EC2 User)

---

## 4. Verification
Once configured:
- **GitHub**: Push to `main`. The `deploy` job should turn green.
- **Jenkins**: Trigger a build. The `Deploy to EC2` stage should succeed.
- **Note**: The pipeline now builds the Docker image **directly on your EC2 server**. This avoids needing a Docker Hub account but requires good CPU/RAM on your EC2 instance.
