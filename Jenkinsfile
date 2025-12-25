pipeline {
    agent any

    tools {
        nodejs 'NodeJS' // Ensure this tool is configured in Jenkins Global Tool Configuration
    }

    triggers {
        // Poll SCM every 2 minutes for changes
        pollSCM('H/2 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm install'
                    } else {
                        bat 'npm install'
                    }
                }
            }
        }

        stage('Lint') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run lint'
                    } else {
                        bat 'npm run lint'
                    }
                }
            }
        }

        stage('Build Application') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    def appName = "quickserve-hub"
                    if (isUnix()) {
                        sh "docker build -t ${appName} ."
                    } else {
                        bat "docker build -t ${appName} ."
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    def appName = "quickserve-hub"
                    
                    // Stop container safely
                    try {
                        if (isUnix()) {
                            sh "docker stop ${appName}"
                        } else {
                            bat "docker stop ${appName}"
                        }
                    } catch (Exception e) {
                        echo "Container ${appName} not running or failed to stop (ignoring)."
                    }

                    // Remove container safely
                    try {
                        if (isUnix()) {
                            sh "docker rm ${appName}"
                        } else {
                            bat "docker rm ${appName}"
                        }
                    } catch (Exception e) {
                        echo "Container ${appName} not found or failed to remove (ignoring)."
                    }
                    
                    // Run new container
                    if (isUnix()) {
                        sh "docker run -d -p 80:80 --name ${appName} --restart unless-stopped ${appName}"
                    } else {
                        bat "docker run -d -p 80:80 --name ${appName} --restart unless-stopped ${appName}"
                    }
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
