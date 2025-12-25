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

        stage('Docker Push') {
            steps {
                script {
                    // Use credentials binding for secure login
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                        sh "docker tag quickserve-hub $DOCKER_USER/quickserve-hub:latest"
                        sh "docker push $DOCKER_USER/quickserve-hub:latest"
                    }
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.EC2_USER}@${env.EC2_HOST} '
                            docker stop quickserve-hub || true
                            docker rm quickserve-hub || true
                            docker pull ${env.DOCKER_USER}/quickserve-hub:latest
                            docker run -d --name quickserve-hub -p 80:80 --restart unless-stopped ${env.DOCKER_USER}/quickserve-hub:latest
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
