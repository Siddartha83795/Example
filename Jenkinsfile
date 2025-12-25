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
                    // Build image
                    if (isUnix()) {
                         sh "docker build -t ${appName} ."
                    } else {
                         bat "docker build -t ${appName} ."
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    def appName = "quickserve-hub"
                    def dockerUser = "siddartha83795"
                    
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        if (isUnix()) {
                            sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                            sh "docker tag ${appName} ${dockerUser}/${appName}:latest"
                            sh "docker push ${dockerUser}/${appName}:latest"
                            sh "docker logout"
                        } else {
                            // Windows/Bat version
                            bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin'
                            bat "docker tag ${appName} ${dockerUser}/${appName}:latest"
                            bat "docker push ${dockerUser}/${appName}:latest"
                            bat "docker logout"
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    def appName = "quickserve-hub"
                    def dockerImage = "siddartha83795/quickserve-hub:latest"
                    
                    // Stop container safely
                    try {
                        if (isUnix()) {
                            sh "docker stop ${appName}"
                        } else {
                            bat "docker stop ${appName}"
                        }
                    } catch (Exception e) { 
                        echo "Stop failed (ignoring): ${e.message}" 
                    }

                    // Remove container safely
                    try {
                        if (isUnix()) {
                            sh "docker rm ${appName}"
                        } else {
                            bat "docker rm ${appName}"
                        }
                    } catch (Exception e) { 
                        echo "Remove failed (ignoring): ${e.message}" 
                    }
                    
                    // Pull and Run new container
                    if (isUnix()) {
                        sh "docker pull ${dockerImage}"
                        sh "docker run -d -p 80:80 --name ${appName} --restart unless-stopped ${dockerImage}"
                    } else {
                        bat "docker pull ${dockerImage}"
                        bat "docker run -d -p 80:80 --name ${appName} --restart unless-stopped ${dockerImage}"
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
