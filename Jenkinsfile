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
                    // Adjust the image name as needed
                    def appName = "vite-react-shadcn-ts"
                    sh "docker build -t ${appName} ."
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
