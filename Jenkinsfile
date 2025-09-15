pipeline {
    agent any

    environment {
        REGISTRY_URL = 'docker.io/kiiilllerbot'
        REGISTRY_CREDENTIALS = 'docker-registry-creds'
        IMAGE_NAME = 'laraops'
        IMAGE_TAG = "${env.BRANCH_NAME == 'main' ? 'latest' : env.BRANCH_NAME}"
    }

    options {
        timestamps()
        ansiColor('xterm')
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Inject .env') {
            steps {
                withCredentials([file(credentialsId: 'laravel-env-file', variable: 'ENV_FILE')]) {
                    sh 'cp "$ENV_FILE" .env'
                }
            }
        }

        stage('Validate') {
            steps {
                sh 'php -v | head -n 1 || true'
                sh 'node -v || true'
                sh 'composer -V || true'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'composer install --no-interaction --prefer-dist'
                sh 'npm ci --no-audit --no-fund'
            }
        }

        stage('Build assets') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Run tests') {
            steps {
                sh 'composer test'
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
            steps {
                sh "docker build -t ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Docker login') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([usernamePassword(credentialsId: env.REGISTRY_CREDENTIALS, usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
                    sh "echo $REG_PASS | docker login ${REGISTRY_URL} -u $REG_USER --password-stdin"
                }
            }
        }

        stage('Docker push') {
            when {
                branch 'main'
            }
            steps {
                sh "docker push ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }
    }

    post {
        always {
            sh "docker logout ${REGISTRY_URL} || true"
            archiveArtifacts artifacts: 'public/build/**', allowEmptyArchive: true
            junit allowEmptyResults: true, testResults: 'storage/test-reports/**/*.xml'
        }
    }
}