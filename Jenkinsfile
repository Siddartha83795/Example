pipeline {
    agent any

    tools {
        nodejs 'NodeJS' // Ensure this tool is configured in Jenkins Global Tool Configuration
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Lint') {
            steps {
                // Fails the build if linting errors occur
                sh 'npm run lint'
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    def appName = "quickserve-hub"
                    // Build image
                    sh "docker build -t ${appName} ."
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.EC2_USER}@${env.EC2_HOST} '
                            # Ensure git is installed
                            sudo dnf install git -y || sudo apt-get install git -y
                            
                            # Clone or Pull repository
                            if [ ! -d "quickserve-hub" ]; then
                                git clone https://github.com/Siddartha83795/Example.git quickserve-hub
                            fi
                            
                            cd quickserve-hub
                            git fetch origin main
                            git reset --hard origin/main
                            
                            # Build image locally
                            docker build -t quickserve-hub .
                            
                            # Restart container
                            docker stop quickserve-hub || true
                            docker rm quickserve-hub || true
                            docker run -d --name quickserve-hub -p 80:80 --restart unless-stopped quickserve-hub
                        '
                    """
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
