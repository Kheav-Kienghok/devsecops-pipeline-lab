pipeline {
    agent any

    environment {
        SONAR_HOME = tool "Sonar-Scanner"
        IMAGE_NAME = "devop-app"
    }

    stages {

        stage('Clone from GitHub') {
            steps {
                git url: 'https://github.com/Kheav-Kienghok/DevOp-Assignment-6.git', branch: 'main'
                echo 'Cloning Done'
            }
        }

        stage('SonarQube Quality Check') {
            steps {
                withSonarQubeEnv("Jenkin-To-SonarQube") {
                    sh """
                    ${SONAR_HOME}/bin/sonar-scanner \
                    -Dsonar.projectName=DevOp-Assignment-6 \
                    -Dsonar.projectKey=devop-assignment-6 \
                    -Dsonar.sources=. 
                    """
                }
                echo 'Scanning Done'
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Trivy File Scan') {
            steps {
                sh '''
                docker run --rm \
                -v $(pwd):/app \
                aquasec/trivy fs /app/my_task_project
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME ./my_task_project'
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh '''
                docker run --rm \
                -v /var/run/docker.sock:/var/run/docker.sock \
                aquasec/trivy image $IMAGE_NAME
                '''
            }
        }

        stage('Load .env Securely') {
            steps {
                withCredentials([file(credentialsId: 'my-env-file', variable: 'ENV_FILE')]) {
                    sh 'cp $ENV_FILE .env'
                }
            }
        }

        stage('Deploy Container') {
            steps {
                sh '''
                docker rm -f devop-container || true
                docker run -d --name devop-container -p 3000:3000 \
                --env-file .env \
                $IMAGE_NAME
                '''
            }
        }
    }
}