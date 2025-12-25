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

        stage('Deploy') {
            steps {
                script {
                    // Stop any existing container
                    sh "docker stop quickserve-hub || true"
                    sh "docker rm quickserve-hub || true"
                    
                    // Run the new container
                    // Usage: docker run -d -p <HOST_PORT>:<CONTAINER_PORT> --name <NAME> <IMAGE>
                    sh "docker run -d -p 80:80 --name quickserve-hub --restart unless-stopped quickserve-hub"
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
