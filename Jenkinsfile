pipeline {
    agent none

    parameters {
        string(name: 'BRANCH', defaultValue: 'main', description: 'Branch to build')
    }

    environment {
        REGISTRY_URL = 'docker.io/kiiilllerbot'
        REGISTRY_CREDENTIALS = 'docker-registry-creds'
        IMAGE_NAME = 'laraops'
        IMAGE_TAG = "${env.BRANCH_NAME == 'main' ? 'latest' : env.BRANCH_NAME}"
    }

    options {
        timestamps()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Checkout') {
            agent any
            steps {
                checkout scm
            }
        }

        stage('Build and Test') {
            agent any
            steps {
                withCredentials([file(credentialsId: 'laravel-env-file', variable: 'ENV_FILE')]) {
                    sh 'cp "$ENV_FILE" .env'
                }
                
                sh '''
                    # Use Docker to run build/test in container
                    docker run --rm -v $(pwd):/app -w /app composer:2 bash -c "
                        # Install Node.js
                        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
                        apt-get install -y nodejs
                        
                        # Install Composer dependencies
                        composer install --no-interaction --prefer-dist
                        
                        # Install npm dependencies
                        npm ci --no-audit --no-fund
                        
                        # Build assets
                        npm run build
                        
                        # Run tests
                        composer test
                    "
                '''
            }
            post {
                failure {
                    echo 'Tests failed! Docker build will be skipped.'
                }
                success {
                    echo 'All tests passed! Proceeding to Docker build.'
                }
            }
        }

        stage('Docker build') {
            when {
                branch 'main'
            }
            agent any
            steps {
                withCredentials([usernamePassword(credentialsId: env.REGISTRY_CREDENTIALS, usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
                    sh "echo $REG_PASS | docker login ${REGISTRY_URL} -u $REG_USER --password-stdin"
                    sh "docker build -t ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG} ."
                    sh "docker push ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }
    }

    post {
        always {
            node('') {
                sh "docker logout ${REGISTRY_URL} || true"
                archiveArtifacts artifacts: 'public/build/**', allowEmptyArchive: true
                junit allowEmptyResults: true, testResults: 'storage/test-reports/**/*.xml'
            }
        }
    }
}