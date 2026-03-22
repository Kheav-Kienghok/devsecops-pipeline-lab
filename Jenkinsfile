pipeline {
    agent any

    environment {
        SONAR_HOME = tool "Sonar-Scanner"
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
    }
}